import logging

import requests
from django.conf import settings
from django.urls import reverse

from base.models import Settings

from .models import PaymentHistory, PaymentRequest, PaymentTransaction

logger = logging.getLogger(__name__)

MAX_INVOICE_RETRY = 3

# Paystation API status_code values (see paystation.com.bd documentation).
PAYSTATION_INVALID_CREDENTIAL = "1001"
PAYSTATION_DUPLICATE_INVOICE = "1008"


class PaymentUtility:
    """Payment utility class using serializers for data validation and processing"""

    def __init__(self, request, payment_history: PaymentHistory):
        """
        Initialize Payment Utility
        """
        self.payment_history: PaymentHistory = payment_history
        self.payment_request: PaymentRequest = payment_history.payment_request
        self.__paystation_marchant_id = settings.PAYSTATION_MARCHANT_ID
        self.__paystation_password = settings.PAYSTATION_PASSWORD
        self.callback_url = Settings.BACKEND_URL + reverse("payments:callback")
        self.initiate_payment_url = settings.PAYSTATION_INITIATE_URL
        self.transaction_status_url = settings.PAYSTATION_TRANSACTION_STATUS_URL
        self.request_timeout = settings.PAYSTATION_REQUEST_TIMEOUT

    def _initiate_payment_payload(self):
        return {
            "merchantId": self.__paystation_marchant_id,
            "password": self.__paystation_password,
            "invoice_number": self.payment_request.invoice_number,
            "currency": self.payment_history.currency,
            "payment_amount": int(self.payment_history.amount),
            "pay_with_charge": 1,
            "cust_name": self.payment_history.user.get_full_name(),
            "cust_phone": self.payment_history.user.phone,
            "cust_email": self.payment_history.user.email,
            "callback_url": self.callback_url,
        }

    def _gateway_error(self, status_code: int, message: str) -> dict:
        return {"status_code": status_code, "message": message}

    def _initiate_payment_request(self):
        try:
            response = requests.post(
                self.initiate_payment_url,
                data=self._initiate_payment_payload(),
                timeout=self.request_timeout,
            )
            response.raise_for_status()
            self.response = response.json()

        except requests.exceptions.Timeout:
            logger.warning(
                "Paystation initiate-payment timed out after %ss",
                self.request_timeout,
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.response = self._gateway_error(
                504, "Payment gateway timed out. Please try again."
            )
        except requests.exceptions.RequestException as exc:
            logger.warning(
                "Paystation initiate-payment request failed: %s",
                exc,
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.response = self._gateway_error(
                504, "Failed to connect to payment gateway"
            )
        except ValueError:
            logger.exception(
                "Paystation initiate-payment returned invalid JSON",
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.response = self._gateway_error(
                502, "Invalid response from payment gateway"
            )

    def _save_initiate_payment_response(self, success: bool):
        self.payment_request.status_code = self.response.get("status_code")
        self.payment_request.status = "SUCCESS" if success else "FAILED"
        self.payment_request.message = self.response.get("message")
        self.payment_request.payment_url = self.response.get("payment_url")
        self.payment_request.payment_url_expiry = self.response.get(
            "payment_url_expiry"
        )
        self.payment_request.save(
            update_fields=[
                "status_code",
                "status",
                "message",
                "payment_url",
                "payment_url_expiry",
            ]
        )

    def initiate_payment(self, retry_count: int = 0):
        """
        Initiate payment using serializer validation
        """
        self._initiate_payment_request()

        status_code = self.response.get("status_code")

        if status_code == "200":
            self._save_initiate_payment_response(success=True)
            return {
                "status_code": int(status_code),
                "message": self.response.get("message"),
                "payment_url": self.response.get("payment_url"),
            }

        if (
            status_code == PAYSTATION_DUPLICATE_INVOICE
            and retry_count < MAX_INVOICE_RETRY
        ):  # noqa: E501
            self.payment_request.update_invoice_number()
            return self.initiate_payment(retry_count=retry_count + 1)

        if status_code in (504, "504"):
            return self.response

        if status_code == PAYSTATION_INVALID_CREDENTIAL:
            logger.error(
                "Paystation rejected credentials (status 1001). env=%s url=%s merchant=%s",  # noqa: E501
                settings.PAYSTATION_ENV,
                self.initiate_payment_url,
                self.__paystation_marchant_id,
            )
            self._save_initiate_payment_response(success=False)
            return {
                "status_code": 502,
                "status": "failed",
                "message": (
                    "Payment gateway credentials are invalid for the configured environment. Use PAYSTATION_ENV=sandbox with sandbox merchant credentials, or PAYSTATION_ENV=live with your live Paystation merchant ID and password."  # noqa: E501
                ),
            }

        self._save_initiate_payment_response(success=False)
        return {
            "status_code": 500,
            "status": "failed",
            "message": self.response.get("message") or "Payment initiation failed",
        }

    def _payment_callback_headers(self):
        return {"merchantId": self.__paystation_marchant_id}

    def _payment_callback_payload(self):
        return {
            "invoice_number": self.payment_request.invoice_number,
        }

    def _payment_callback_request(self):
        try:
            response = requests.post(
                self.transaction_status_url,
                headers=self._payment_callback_headers(),
                data=self._payment_callback_payload(),
                timeout=self.request_timeout,
            )
            response.raise_for_status()
            self.callback_response = response.json()

        except requests.exceptions.Timeout:
            logger.warning(
                "Paystation transaction-status timed out after %ss",
                self.request_timeout,
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.callback_response = self._gateway_error(
                504, "Payment gateway timed out. Please try again."
            )
        except requests.exceptions.RequestException as exc:
            logger.warning(
                "Paystation transaction-status request failed: %s",
                exc,
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.callback_response = self._gateway_error(
                504, "Failed to connect to payment gateway"
            )
        except ValueError:
            logger.exception(
                "Paystation transaction-status returned invalid JSON",
                extra={"invoice": self.payment_request.invoice_number},
            )
            self.callback_response = self._gateway_error(
                502, "Invalid response from payment gateway"
            )

    def _verify_trx_id(self):
        if not self.payment_request.callback_log.trx_id:
            return False

        return (
            self.callback_response["data"].get("trx_id")
            == self.payment_request.callback_log.trx_id
        )

    def _save_payment_callback_response(self):
        transaction: PaymentTransaction = self.payment_request.transaction
        trx_status = self.callback_response["data"].get("trx_status").upper()
        transaction.trx_status = trx_status if trx_status != "CANCELLED" else "CANCELED"
        transaction.trx_id = (
            None
            if self.callback_response["data"].get("trx_id") == ""
            else self.callback_response["data"].get("trx_id")
        )
        transaction.payment_amount = self.callback_response["data"].get(
            "payment_amount"
        )
        transaction.order_date_time = self.callback_response["data"].get(
            "order_date_time"
        )
        transaction.payer_mobile_no = self.callback_response["data"].get(
            "payer_mobile_no"
        )
        transaction.payment_method = self.callback_response["data"].get(
            "payment_method"
        )
        transaction.is_verified = self._verify_trx_id()
        transaction.save(
            update_fields=[
                "trx_id",
                "trx_status",
                "payment_amount",
                "order_date_time",
                "payer_mobile_no",
                "payment_method",
                "is_verified",
            ]
        )

    def handle_payment_callback(self):
        self._payment_callback_request()

        if self.callback_response.get("status_code") == "200":
            self._save_payment_callback_response()

        elif self.callback_response.get("status_code") == "2001":
            return {
                "status_code": "2001",
                "status": "failed",
                "message": "Invalid Token.",
            }

        elif self.callback_response.get("status_code") in (504, "504"):
            return {
                "status_code": 504,
                "status": "failed",
                "message": self.callback_response.get(
                    "message", "Failed to connect to payment gateway"
                ),
            }
