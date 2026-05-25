"""Paystation API endpoints — keep sandbox and live URLs in sync with credentials."""

SANDBOX_INITIATE_URL = "https://sandbox.paystation.com.bd/initiate-payment"
SANDBOX_TRANSACTION_STATUS_URL = "https://sandbox.paystation.com.bd/transaction-status"
LIVE_INITIATE_URL = "https://api.paystation.com.bd/initiate-payment"
LIVE_TRANSACTION_STATUS_URL = "https://api.paystation.com.bd/transaction-status"


def paystation_urls(env: str) -> tuple[str, str]:
    if env.strip().lower() == "live":
        return LIVE_INITIATE_URL, LIVE_TRANSACTION_STATUS_URL
    return SANDBOX_INITIATE_URL, SANDBOX_TRANSACTION_STATUS_URL
