import os
import inspect
import logging

from datetime import datetime
from traceback import format_exc

import sentry_sdk

TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
SENTRY_DSN = os.environ.get("SENTRY_DSN", "")
production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False

cwd = os.getcwd()
errors_folder = f"{cwd}/static/errors"


def timestamp():
    return str(datetime.now())


def create_path(cik, stamp):
    return f"{errors_folder}/error-{cik}-{stamp}.log"


def cleanup_errors():
    for file in os.listdir(errors_folder):
        error_path = f"{errors_folder}/{file}"
        if file.endswith(".log"):
            try:
                now = datetime.now().timestamp()
                modified = os.path.getmtime(error_path)
                expire_time = 60 * 60 * 24 * 3

                if now - modified > expire_time:
                    os.remove(error_path)
            except FileNotFoundError:
                pass


def format_error(e, program=None):
    if not program:
        try:
            program = inspect.stack()[2][3]
        except KeyError:
            program = "Program"

    error_log = f"Error Occurred During '{program}'"
    error_log += f"\n{repr(e)}\n{format_exc()}"

    return error_log


def report_error(identifier, e):

    if not production_environment:
        raise e

    stamp = timestamp()
    error_path = create_path(identifier, stamp)
    with open(error_path, "w") as f:
        if production_environment and run_telemetry:
            sentry_sdk.capture_exception(e)
        error = format_error(e)
        logging.error(error)
        f.write(error)
