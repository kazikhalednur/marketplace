from decouple import config

CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BROKER_URL = config("CELERY_BROKER_URL", cast=str)

# Result backend configuration
CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/1"  # Using Redis DB 1 for results
CELERY_RESULT_BACKEND_TRANSPORT_OPTIONS = {
    "master_name": "mymaster",
}
CELERY_RESULT_EXPIRES = 3600  # Results expire after 1 hour
CELERY_TASK_RESULT_EXPIRES = 3600  # Task results expire after 1 hour
CELERY_RESULT_PERSISTENT = True  # Persist results to disk
