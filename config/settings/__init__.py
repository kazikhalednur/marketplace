from decouple import config

SERVER_TYPE = config("SERVER_TYPE")

if SERVER_TYPE == "production":
    from .prod import *
elif SERVER_TYPE == "staging":
    from .staging import *
elif SERVER_TYPE == "local":
    from .local import *
else:
    raise ValueError(
        "Couldn't read SERVER_TYPE. Did you forget to add SERVER_TYPE in .env file?"
    )
