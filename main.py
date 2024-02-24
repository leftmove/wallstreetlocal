from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import logging
import os

from routers import general
from routers import filer
from routers import stocks
from routers.utils import (
    PrometheusMiddleware,
    metrics,
    EndpointFilter,
    setting_otlp,
    initialize,
)

APP_NAME = os.environ.get("APP_NAME", "backend")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
HOST = os.environ.get("HOST", "0.0.0.0")
EXPOSE_PORT = int(os.environ.get("EXPOSE_PORT", 8000))
FORWARDED_ALLOW_IPS = os.environ.get("FORWARDED_ALLOW_IPS", "*")
WORKERS = int(os.environ.get("WORKERS", "9" if ENVIRONMENT == "production" else "1"))
OTLP_GRPC_ENDPOINT = os.environ.get("OTLP_GRPC_ENDPOINT", "http://trace:4317")
production_environment = True if ENVIRONMENT == "production" else False

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    ),
]
if production_environment:
    middleware.append(
        Middleware(PrometheusMiddleware, app_name=APP_NAME),
    )

app = FastAPI(middleware=middleware)
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)
if production_environment:
    app.add_route("/metrics", metrics)

l = logging.getLogger("uvicorn.access")
if production_environment:
    l.addFilter(EndpointFilter())
log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = (
    "%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] [trace_id=%(otelTraceID)s span_id=%(otelSpanID)s resource.service.name=%(otelServiceName)s] - %(message)s"
    if production_environment
    else "%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] - %(message)s"
)

if __name__ == "__main__":
    initialize()
    if production_environment:
        setting_otlp(app, APP_NAME, OTLP_GRPC_ENDPOINT)
        uvicorn.run(
            app,
            host=HOST,
            port=EXPOSE_PORT,
            log_config=log_config,
            forwarded_allow_ips=FORWARDED_ALLOW_IPS,
            workers=WORKERS,
        )
    else:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=EXPOSE_PORT,
            log_config=log_config,
            forwarded_allow_ips=FORWARDED_ALLOW_IPS,
            reload=True,
        )
