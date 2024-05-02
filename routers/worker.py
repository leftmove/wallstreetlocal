import os
import multiprocessing

from celery import Celery

from .filer import create_filer_try, create_filer_replace

REDIS_SERVER_URL = os.environ.get("REDIS_SERVER_URL", "cache")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
BROKER = f"redis://{REDIS_SERVER_URL}:{REDIS_PORT}/0"
WORKERS = int(os.environ.get("WORKERS", ((multiprocessing.cpu_count() * 2) + 1)))


config = {"worker_concurrency": WORKERS, "broker_connection_retry_on_startup": True}

queue = Celery("worker", broker=BROKER)
queue.config_from_object(config)


@queue.task
def try_filer(cik):
    create_filer_try(cik, False)


@queue.task
def replace_filer(cik):
    create_filer_replace(cik, False)
