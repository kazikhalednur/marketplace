from decouple import config

CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BROKER_URL = config("CELERY_BROKER_URL", cast=str)

# Result backend configuration
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", cast=str)
CELERY_RESULT_BACKEND_TRANSPORT_OPTIONS = {
    "master_name": "mymaster",
}
CELERY_RESULT_EXPIRES = 3600  # Results expire after 1 hour
CELERY_TASK_RESULT_EXPIRES = 3600  # Task results expire after 1 hour
CELERY_RESULT_PERSISTENT = True  # Persist results to disk
