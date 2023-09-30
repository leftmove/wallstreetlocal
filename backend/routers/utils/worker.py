from celery import Celery


from dotenv import load_dotenv
from os import getenv


load_dotenv()

MONGO_SERVER_URL = getenv("MONGO_SERVER_URL")
REDIS_SERVER_URL = getenv("REDIS_SERVER_URL")
CELERY_SERVER_URL = f"redis://{REDIS_SERVER_URL}:6379/0"
MONGO_WORKER_URL = f"mongodb://{MONGO_SERVER_URL}:27017/"

result_backend = MONGO_SERVER_URL
mongodb_backend_settings = {
    "database": "wallstreetlocal",
    "taskmeta_collection": "tasks",
}
worker = Celery("tasks", broker=CELERY_SERVER_URL, backend=MONGO_WORKER_URL)  # type: ignore

from .scrape import *
