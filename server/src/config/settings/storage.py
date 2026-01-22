from pathlib import Path

from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

OPTIONS = {
    "access_key": open(BASE_DIR / config("MINIO_ACCESS_KEY_FILE", cast=str), "r")
    .read()
    .strip(),
    "secret_key": open(BASE_DIR / config("MINIO_SECRET_KEY_FILE", cast=str), "r")
    .read()
    .strip(),
    "bucket_name": config("MINIO_BUCKET_NAME", cast=str),
    "signature_version": config("MINIO_SIGNATURE_VERSION", cast=str),
    "endpoint_url": config("MINIO_ENDPOINT_URL", cast=str),
    "url_protocol": "https:" if config("MINIO_USE_SSL", cast=bool) else "http:",
    "region_name": config("MINIO_REGION_NAME", cast=str),
    "use_ssl": config("MINIO_USE_SSL", cast=bool),
    "verify": config("MINIO_VERIFY", cast=bool),
    "addressing_style": config("MINIO_ADDRESSING_STYLE", cast=str),
    "custom_domain": config("MINIO_CUSTOM_DOMAIN", cast=str),
    "file_overwrite": False,
}

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": OPTIONS,
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            **OPTIONS,
            "location": "static",
        },
    },
}


__all__ = ["STORAGES"]
