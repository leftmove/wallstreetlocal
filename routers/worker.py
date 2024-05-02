import os
import multiprocessing

from celery import Celery, signals

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

from .filer import create_filer_try, create_filer_replace

REDIS_SERVER_URL = os.environ.get("REDIS_SERVER_URL", "cache")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
BROKER = f"redis://{REDIS_SERVER_URL}:{REDIS_PORT}/0"
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
WORKERS = int(os.environ.get("WORKERS", ((multiprocessing.cpu_count() * 2) + 1)))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False


config = {"worker_concurrency": WORKERS, "broker_connection_retry_on_startup": True}

queue = Celery("worker", broker=BROKER)
queue.config_from_object(config)


@signals.celeryd_init.connect
def init_worker(**kwargs):
    if production_environment:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            enable_tracing=True,
            integrations=[CeleryIntegration()],
        )


@queue.task
def try_filer(cik):
    create_filer_try(cik, False)


@queue.task
def replace_filer(cik):
    create_filer_replace(cik, False)


@queue.task
def delay_error():
    1 / 0
