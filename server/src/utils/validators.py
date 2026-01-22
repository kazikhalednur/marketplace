from rest_framework.serializers import ValidationError


def validate_file_size(file, max_size_mb=2):
    """
    Validates that file size is less than max_size_mb (default: 2MB).
    """
    limit = max_size_mb * 1024 * 1024  # Convert MB to Bytes
    if file.size > limit:
        raise ValidationError(
            {"file": f"File too large. Size should not exceed {max_size_mb} MB."}
        )
