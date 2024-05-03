import os
import inspect
import logging

from datetime import datetime
from traceback import format_exc

import sentry_sdk

TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False
cwd = os.getcwd()


def timestamp():
    return str(datetime.now())


def create_path(cik, stamp):
    return f"{cwd}/static/errors/error-{cik}-{stamp}.log"


def format_error(e, program=None):
    if not program:
        try:
            program = inspect.stack()[2][3]
        except KeyError:
            program = "Program"

    error_log = f"Error Occurred During '{program}'"
    error_log += f"\n{repr(e)}\n{format_exc()}"

    return error_log


def report_error(cik, e):
    stamp = timestamp()
    error_path = create_path(cik, stamp)
    with open(error_path, "w") as f:
        if production_environment and run_telemetry:
            sentry_sdk.capture_exception(e)
        error = format_error(e)
        logging.erro(error)
        f.write(error)
