import uuid
from typing import Any, Dict, Optional

import requests
from django.core.exceptions import ValidationError

from .models import InitiatePayment, SSLCommerzConfig
from .serializers import InitiatePaymentResponseSerializer, InitiatePaymentSerializer


class PaymentUtility:
    """Payment utility class using serializers for data validation and processing"""

    def __init__(self, config_name: str = None):
        """
        Initialize Payment Utility

        Args:
            config_name (str): Name of the configuration to use.
                             If None, uses the first active configuration.
        """
        self.config = self._get_config(config_name)
        if not self.config:
            raise ValueError("No active SSLCommerz configuration found")

    def _get_config(self, config_name: str = None) -> Optional[SSLCommerzConfig]:
        """Get SSLCommerz configuration"""
        if config_name:
            try:
                return SSLCommerzConfig.objects.get(name=config_name, is_active=True)
            except SSLCommerzConfig.DoesNotExist:
                raise ValueError(f"Configuration '{config_name}' not found or inactive")
        else:
            return SSLCommerzConfig.objects.filter(is_active=True).first()

    def _generate_tran_id(self) -> str:
        """Generate unique transaction ID"""
        return str(uuid.uuid4().hex[:10])

    def _prepare_sslcommerz_data(
        self,
        request,
        user,
        amount: float,
        currency: str = "BDT",
        additional_data: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Prepare data for SSLCommerz API call

        Args:
            user: Django User instance
            amount (float): Payment amount
            currency (str): Currency code (default: BDT)
            additional_data (dict): Additional data for payment

        Returns:
            dict: Prepared SSLCommerz API data
        """
        tran_id = self._generate_tran_id()

        # Get user profile data
        user_email = getattr(user, "email", "")
        user_first_name = getattr(user, "first_name", "")
        user_last_name = getattr(user, "last_name", "")
        user_name = f"{user_first_name} {user_last_name}".strip() or user.username

        # Get user phone from profile if available
        user_phone = ""
        if hasattr(user, "clientprofile"):
            user_phone = getattr(user.clientprofile, "phone", "")
        elif hasattr(user, "freelancerprofile"):
            user_phone = getattr(user.freelancerprofile, "phone", "")

        # Get user address from profile if available
        user_address = ""
        user_city = ""
        if hasattr(user, "clientprofile"):
            user_address = getattr(user.clientprofile, "address", "")
            user_city = getattr(user.clientprofile, "city", "")
        elif hasattr(user, "freelancerprofile"):
            user_address = getattr(user.freelancerprofile, "address", "")
            user_city = getattr(user.freelancerprofile, "city", "")

        # Base SSLCommerz API data
        sslcommerz_data = {
            "store_id": self.config.store_id,
            "store_passwd": self.config.store_password,
            "total_amount": amount,
            "currency": currency,
            "tran_id": tran_id,
            "success_url": self.config.success_url,
            "fail_url": self.config.fail_url,
            "cancel_url": self.config.cancel_url,
            "ipn_url": self.config.ipn_url,
            "cus_name": user_name,
            "cus_email": user_email,
            "cus_add1": user_address or "N/A",
            "cus_city": user_city or "Dhaka",
            "cus_phone": user_phone or "01700000000",
            "cus_country": "Bangladesh",
            "shipping_method": "YES",
            "ship_name": "CPC WOR HUB Marketplace",
            "ship_add1": "Daffodil International University",
            "ship_city": "Dhaka",
            "ship_postcode": "1341",
            "ship_country": "Bangladesh",
            "product_name": "Job Payment",
            "product_category": "Freelancing",
            "product_profile": "general",
        }

        # Add additional data if provided
        if additional_data:
            sslcommerz_data.update(additional_data)

        return sslcommerz_data

    def initiate_payment(
        self,
        request,
        user,
        amount: float,
        currency: str = "BDT",
        additional_data: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Initiate payment using serializer validation

        Args:
            user: Django User instance
            amount (float): Payment amount
            currency (str): Currency code (default: BDT)
            additional_data (dict): Additional data for payment

        Returns:
            dict: Response with serializer data and API response
        """
        try:
            # Prepare SSLCommerz API data
            request_data = self._prepare_sslcommerz_data(
                request, user, amount, currency, additional_data
            )

            # Validate data using serializer
            serializer = InitiatePaymentSerializer(data=request_data)
            serializer.is_valid(raise_exception=True)

            # Make API request to SSLCommerz
            response = requests.post(
                self.config.api_url, data=serializer.data, timeout=30
            )
            # Parse response
            response_data = (
                response.json()
                if response.headers.get("content-type", "").startswith(
                    "application/json"
                )
                else {}
            )

            # Create InitiatePayment record with validated data
            initiate_payment_data = {
                "user": user,
                "tran_id": serializer.data["tran_id"],
                "total_amount": amount,
                "currency": currency,
                "status": response_data.get("status", "FAILED"),
                "failedreason": response_data.get("failedreason", ""),
                "sessionkey": response_data.get("sessionkey", ""),
                "GatewayPageURL": response_data.get("GatewayPageURL", ""),
            }

            initiate_payment = InitiatePayment.objects.create(**initiate_payment_data)

            initiate_payment_serializer = InitiatePaymentResponseSerializer(
                data=initiate_payment_data
            )
            initiate_payment_serializer.is_valid(raise_exception=True)

            return {
                "success": True,
                "data": initiate_payment_serializer.data,
                "message": "Payment initiated successfully",
                "payment": initiate_payment,
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}",
                "message": "Failed to connect to payment gateway",
            }
        except ValidationError as e:
            return {
                "success": False,
                "error": f"Validation error: {str(e)}",
                "message": "Payment data validation failed",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "message": "Payment initiation failed",
            }
