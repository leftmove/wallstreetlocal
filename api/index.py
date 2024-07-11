from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import os
import multiprocessing

from routers import general
from routers import filer
from routers import stocks

from routers.utils import (
    log_config,
    initialize,
)

APP_NAME = os.environ.get("APP_NAME", "backend")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
HOST = os.environ.get("HOST", "0.0.0.0")
EXPOSE_PORT = int(os.environ.get("EXPOSE_PORT", 8000))
FORWARDED_ALLOW_IPS = os.environ.get("FORWARDED_ALLOW_IPS", "*")
WORKERS = int(os.environ.get("WORKERS", (multiprocessing.cpu_count() + 1)))
production_environment = True if ENVIRONMENT == "production" else False

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    ),
]

app = FastAPI(middleware=middleware)
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)

if __name__ == "__main__":
    initialize()
    if production_environment:
        uvicorn.run(
            "main:app",
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
