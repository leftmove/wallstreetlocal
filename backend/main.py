from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import general
from routers import filer
from routers import stocks

app = FastAPI()
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)