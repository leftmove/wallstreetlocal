import os
import multiprocessing
from dotenv import load_dotenv

from celery import Celery, signals
from celery.utils.log import get_task_logger

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration


from routers import filer
from routers.lib.cache import (
    REDIS_SERVER_URL,
    REDIS_PORT,
    REDIS_SSL,
    REDIS_USERNAME,
    REDIS_PASSWORD,
)
from routers.lib.database import MONGO_SERVER_URL
from routers.lib.errors import SENTRY_DSN

load_dotenv()

BROKER = f"redis{'s' if REDIS_SSL else ''}://{REDIS_USERNAME}:{REDIS_PASSWORD}@{REDIS_SERVER_URL}:{REDIS_PORT}{'?ssl_cert_reqs=required' if REDIS_SSL else ''}"

WORKERS = int(os.environ.get("WORKERS", ((multiprocessing.cpu_count() * 2) + 1)))
TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

__all__ = []


production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False
logger = get_task_logger(__name__)


class Config:
    timezone = "America/Detroit"
    worker_concurrency = WORKERS
    concurrency = 1
    broker_connection_retry_on_startup = True
    celery_task_always_eager = False if production_environment else True
    beat_schedule = {
        "add-every-couple-seconds": {
            "task": "tasks.add",
            "schedule": 5.0,
            "args": (16, 16),
        },
    }


queue = Celery("worker", broker=BROKER, backend=MONGO_SERVER_URL)
queue.config_from_object(Config)


@queue.task
def add(x, y):
    z = x + y
    print(z)


@signals.celeryd_init.connect
def init_worker(*args, **kwargs):
    if production_environment and run_telemetry:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            enable_tracing=True,
            # Set traces_sample_rate to 1.0 to capture 100%
            # of transactions for tracing.
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100%
            # of sampled transactions.
            # We recommend adjusting this value in production.
            profiles_sample_rate=1.0,
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
