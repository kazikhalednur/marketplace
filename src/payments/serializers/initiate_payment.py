from rest_framework import serializers


class InitiatePaymentSerializer(serializers.Serializer):
    """Payment serializer using base Serializer class"""

    store_id = serializers.CharField(max_length=100)
    store_passwd = serializers.CharField(max_length=200)

    # Primary key - UUID field
    tran_id = serializers.CharField(max_length=30)

    # Payment details
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default="BDT")

    # IPN (Instant Payment Notification) details
    success_url = serializers.URLField(
        required=False, allow_blank=True, allow_null=True
    )
    fail_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    cancel_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    ipn_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    # Customer details
    cus_name = serializers.CharField(max_length=100)
    cus_email = serializers.EmailField()
    cus_add1 = serializers.CharField(max_length=200)
    cus_city = serializers.CharField(max_length=50)
    cus_phone = serializers.CharField(max_length=20)
    cus_country = serializers.CharField(max_length=50, default="Bangladesh")

    # Shipping details
    shipping_method = serializers.ChoiceField(
        choices=[("YES", "Yes"), ("NO", "No")], default="YES"
    )
    ship_name = serializers.CharField(max_length=100, default="CPC WOR HUB Marketplace")
    ship_add1 = serializers.CharField(
        max_length=200, default="Daffodil International University"
    )
    ship_city = serializers.CharField(max_length=50, default="Dhaka")
    ship_postcode = serializers.CharField(max_length=10, default="1341")
    ship_country = serializers.CharField(max_length=50, default="Bangladesh")

    # Product details
    product_name = serializers.CharField(max_length=100, default="Job Payment")
    product_category = serializers.CharField(max_length=50, default="Freelancing")
    product_profile = serializers.CharField(max_length=50, default="general")

    # Timestamps
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate_total_amount(self, value):
        """Validate that total_amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Total amount must be greater than zero.")
        return value

    def validate_cus_phone(self, value):
        """Validate phone number format"""
        if not value.replace("+", "").replace("-", "").replace(" ", "").isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits, spaces, +, and - characters."
            )
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Validate that if shipping_method is YES, shipping details should be provided
        if data.get("shipping_method") == "YES":
            required_shipping_fields = [
                "ship_name",
                "ship_add1",
                "ship_city",
                "ship_country",
            ]
            for field in required_shipping_fields:
                if not data.get(field):
                    raise serializers.ValidationError(
                        f"{field} is required when shipping_method is YES."
                    )

        return data
