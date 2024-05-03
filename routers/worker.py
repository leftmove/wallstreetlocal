import os
import multiprocessing

from celery import Celery, signals

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

from . import filer

REDIS_SERVER_URL = os.environ.get("REDIS_SERVER_URL", "cache")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
BROKER = f"redis://{REDIS_SERVER_URL}:{REDIS_PORT}/0"
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
WORKERS = int(os.environ.get("WORKERS", ((multiprocessing.cpu_count() * 2) + 1)))
TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False

config = {"worker_concurrency": WORKERS, "broker_connection_retry_on_startup": True}

queue = Celery("worker", broker=BROKER)
queue.config_from_object(config)


@signals.celeryd_init.connect
def init_worker(**kwargs):
    if production_environment and run_telemetry:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            enable_tracing=True,
            integrations=[CeleryIntegration()],
        )


@queue.task
def create_recent(**kwargs):
    filer.create_recent(**kwargs)


@queue.task
def create_historical(**kwargs):
    filer.create_historical(**kwargs)


@queue.task
def create_filer(**kwargs):
    filer.create_filer(**kwargs)


@queue.task
def try_filer(**kwargs):
    filer.create_filer_try(**kwargs)


@queue.task
def replace_filer(**kwargs):
    filer.create_filer_replace(**kwargs)


@queue.task
def delay_error():
    1 / 0
