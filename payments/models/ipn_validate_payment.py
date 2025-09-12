from django.db import models

from .initiate_payment import InitiatePayment


class IPNValidatePayment(models.Model):
    """IPN (Instant Payment Notification) validation payment model"""

    initiate_payment = models.OneToOneField(
        InitiatePayment,
        on_delete=models.CASCADE,
        related_name="ipn_validate_payment",
        verbose_name="Initiate Payment",
    )

    class Status(models.TextChoices):
        VALID = "VALID", "Valid"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        UNATTEMPTED = "UNATTEMPTED", "Unattempted"
        EXPIRED = "EXPIRED", "Expired"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNATTEMPTED,
        verbose_name="Payment Status",
    )

    # Transaction details
    tran_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Transaction Date",
        help_text=(
            "Payment completion date as 2016-05-08 15:53:49 "
            "(PHP date('Y-m-d H:i:s'))"
        ),
    )

    tran_id = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        verbose_name="Transaction ID",
        help_text=(
            "Transaction ID (Unique) that was sent by you during initiation. "
            "This parameter needs to be validated with your system database "
            "for security"
        ),
    )

    val_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Validation ID",
        help_text=(
            "A Validation ID against the Transaction which is provided by " "SSLCOMMERZ"
        ),
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Amount",
        help_text=(
            "The total amount sent by you. However, it could be changed based "
            "on currency type. This parameter needs to be validated with your "
            "system database for security"
        ),
    )

    store_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Store Amount",
        help_text=(
            "The amount what you will get in your account after bank charge "
            "(Example: 100 BDT will be your store amount of 96 BDT after "
            "4% Bank Commission)"
        ),
    )

    # Card details
    card_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Card Type",
        help_text="The Bank Gateway Name that customer selected",
    )

    card_no = models.CharField(
        max_length=80,
        blank=True,
        null=True,
        verbose_name="Card Number",
        help_text=(
            "Customer's Card number. However, for Mobile Banking and Internet "
            "Banking, it will return customer's reference id"
        ),
    )

    currency = models.CharField(
        max_length=3,
        blank=True,
        null=True,
        verbose_name="Currency",
        help_text=(
            "Currency Type which will be settled with your merchant account "
            "after deducting the Gateway charges. This parameter is the "
            "currency type of the parameter amount"
        ),
    )

    bank_tran_id = models.CharField(
        max_length=80,
        blank=True,
        null=True,
        verbose_name="Bank Transaction ID",
        help_text="The transaction ID at Banks End",
    )

    card_issuer = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Card Issuer",
        help_text="Issuer Bank Name",
    )

    card_brand = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        verbose_name="Card Brand",
        help_text="VISA, MASTER, AMEX, IB or MOBILE BANKING",
    )

    card_issuer_country = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Card Issuer Country",
        help_text="Country of Card Issuer Bank",
    )

    card_issuer_country_code = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        verbose_name="Card Issuer Country Code",
        help_text="2 digits short code of Country of Card Issuer Bank",
    )

    # Currency conversion details
    currency_type = models.CharField(
        max_length=3,
        blank=True,
        null=True,
        verbose_name="Currency Type",
        help_text=(
            "The currency you have sent during initiation of this transaction. "
            "If the currency is different than BDT, then it will be converted "
            "to BDT by the current conversion rate. This parameter needs to be "
            "validated with your system database for security"
        ),
    )

    currency_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Currency Amount",
        help_text=(
            "The currency amount you have sent during initiation of this "
            "transaction. If the amount is not mentioned in BDT, then it will "
            "be converted to BDT by the current conversion rate and return by "
            "the above field amount. This parameter needs to be validated with "
            "your system database for security"
        ),
    )

    # Custom values
    value_a = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Value A",
        help_text="Same Value will be returned as Passed during initiation",
    )

    value_b = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Value B",
        help_text="Same Value will be returned as Passed during initiation",
    )

    value_c = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Value C",
        help_text="Same Value will be returned as Passed during initiation",
    )

    value_d = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Value D",
        help_text="Same Value will be returned as Passed during initiation",
    )

    # Security validation
    verify_sign = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Verify Sign",
        help_text="Data Validation Key",
    )

    verify_key = models.TextField(
        blank=True,
        null=True,
        verbose_name="Verify Key",
        help_text="Data Validation Key",
    )

    # Risk assessment
    risk_level = models.IntegerField(
        blank=True,
        null=True,
        verbose_name="Risk Level",
        help_text=(
            "Transaction's Risk Level - High (1) for most risky transactions "
            "and Low (0) for safe transactions. Please hold the service and "
            "proceed to collect customer verification documents"
        ),
    )

    risk_title = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Risk Title",
        help_text="Transaction's Risk Level Description",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "IPN Validate Payment"
        verbose_name_plural = "IPN Validate Payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"IPN Validate Payment - {self.tran_id} ({self.status})"
