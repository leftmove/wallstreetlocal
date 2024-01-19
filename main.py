from fastapi import FastAPI

from routers import general
from routers import filer
from routers import stocks
from routers import middleware


app = FastAPI(middleware=middleware.pipeline())
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)
