import secrets
import string
import time

BASE62 = string.digits + string.ascii_uppercase + string.ascii_lowercase


def base62_encode(num: int) -> str:
    if num == 0:
        return BASE62[0]

    arr = []
    base = len(BASE62)

    while num:
        num, rem = divmod(num, base)
        arr.append(BASE62[rem])

    return "".join(reversed(arr))


def generate_short_uid(length: int = 10) -> str:
    # current time in milliseconds
    ts = int(time.time() * 1000)

    # 40 bits random entropy
    rand = secrets.randbits(40)

    # combine time + randomness
    combined = (ts << 40) | rand

    encoded = base62_encode(combined)

    return str(encoded[-length:].rjust(length, "0"))
