import os
import multiprocessing
from dotenv import load_dotenv

from celery import Celery, signals

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

from . import filer

load_dotenv()

REDIS_SERVER_URL = os.environ.get("REDIS_SERVER_URL", "cache")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
BROKER = f"redis://{REDIS_SERVER_URL}:{REDIS_PORT}/0"
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
WORKERS = int(os.environ.get("WORKERS", ((multiprocessing.cpu_count() * 2) + 1)))
TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False

class Config:
    worker_concurrency = WORKERS
    conccurrency = 4
    broker_connection_retry_on_startup = True
    celery_task_always_eager = False if production_environment else True
    

queue = Celery("worker", broker=BROKER)
queue.config_from_object(Config)


@signals.celeryd_init.connect
def init_worker(*args, **kwargs):
    if production_environment and run_telemetry:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            enable_tracing=True,
            integrations=[CeleryIntegration()],
        )


@queue.task
def create_recent(*args, **kwargs):
    filer.create_recent(*args, **kwargs)


@queue.task
def create_historical(*args, **kwargs):
    filer.create_historical(*args, **kwargs)


@queue.task
def create_filer(*args, **kwargs):
    filer.create_filer(*args, **kwargs)


@queue.task
def try_filer(*args, **kwargs):
    filer.create_filer_try(*args, **kwargs)


@queue.task
def replace_filer(*args, **kwargs):
    filer.create_filer_replace(*args, **kwargs)


@queue.task
def delay_error():
    1 / 0
