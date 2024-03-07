from fastapi import HTTPException, APIRouter, BackgroundTasks
from pydantic import BaseModel

import logging

from .lib import web
from .lib import database
from .lib import analysis
from .lib.cache import cache

router = APIRouter(
    prefix="/stocks",
    tags=["stocks"],
    responses={},
)


class Cusip(BaseModel):
    cusip: list


@cache
@router.get("/query", tags=["stocks"], status_code=200)
async def query_stocks(cik: str, background: BackgroundTasks):
    if cik:
        filer = database.search_filer(cik, {"stocks.cusip": 1})
        if not filer:
            raise HTTPException(status_code=404, detail="Filer not found")
        tickers = [stock["cusip"] for stock in filer["stocks"]]

        found_stocks = database.find_stocks("ticker", {"$in": tickers})
        background.add_task(web.query_stocks, found_stocks)  # pyright: ignore

    return {"description": "Stocks started updating."}


@cache
@router.get("/info", tags=["stocks", "filers"], status_code=200)
async def stock_info(
    cik: str,
    limit: int,
    offset: int,
    sort: str,
    sold: bool,
    reverse: bool,
    unavailable: bool,
):
    filer = database.find_filer(cik, {"_id": 1})
    if not filer:
        raise HTTPException(detail="Filer not found.", status_code=404)

    try:
        pipeline, count = analysis.sort_pipeline(
            cik, limit, offset, sort, sold, reverse, unavailable
        )
        cursor = database.search_filers(pipeline)
    except Exception as e:
        logging.error(e)
        raise HTTPException(detail="Invalid search requirements.", status_code=422)

    try:
        stock_list = [result for result in cursor]
    except KeyError:
        raise HTTPException(detail="Error while searching.", status_code=500)

    return {"stocks": stock_list, "count": count}


@cache(4)
@router.get("/timeseries", tags=["stocks", "filers"], status_code=200)
async def stock_timeseries(cik: str, time: float):
    filer = database.search_filer(cik, {"stocks.cusip": 1})
    if not filer:
        raise HTTPException(detail="Filer not found.", status_code=404)

    filer_stocks = filer["stocks"]
    stock_list = []
    cusip_list = list(map(lambda x: x["cusip"], filer_stocks))

    pipeline = [
        {"$match": {"cusip": {"$in": cusip_list}}},
        {
            "$project": {
                "_id": 0,
                "cusip": 1,
                "ticker": 1,
                "timeseries": {
                    "$map": {
                        "input": "$timeseries",
                        "as": "time",
                        "in": {
                            "close": "$$time.close",
                            "time": "$$time.time",
                            "diff": {"$abs": {"$subtract": [time, "$$time.time"]}},
                        },
                    }
                },
            }
        },
        {"$unwind": "$timeseries"},
        {"$sort": {"timeseries.diff": 1}},
        {
            "$group": {
                "_id": "$cusip",
                "timeseries": {"$first": "$timeseries"},
            }
        },
        {
            "$project": {
                "cusip": "$_id",
                "_id": 0,
                "timeseries.close": 1,
                "timeseries.time": 1,
            }
        },
    ]

    cursor = database.search_stocks(pipeline)
    for document in cursor:
        cusip = document["cusip"]
        close = document["timeseries"]["close"]
        close_str = f"${close}"
        close_time = document["timeseries"]["time"]
        stock_list.append(
            {
                "cusip": cusip,
                "close": close,
                "close_str": close_str,
                "time": close_time,
            }
        )

    return {"stocks": stock_list}


@router.get("/filing", tags=["filers", "stocks"], status_code=200)
async def query_filing(
    cik: str,
    access_number: str,
    limit: int,
    offset: int,
    sort: str,
    sold: bool,
    reverse: bool,
    unavailable: bool,
):

    filer_query = f"$filings.{access_number}.stocks"
    additonal = [
        {
            "$set": {
                "stocks": {
                    "$map": {
                        "input": {"$objectToArray": filer_query},
                        "as": "stock",
                        "in": "$$stock.v",
                    }
                }
            }
        },
    ]

    try:
        pipeline, count = analysis.sort_pipeline(
            cik, limit, offset, sort, sold, reverse, unavailable, additonal
        )
        cursor = database.search_filers(pipeline)
    except Exception as e:
        logging.error(e)
        raise HTTPException(detail="Invalid search requirements.", status_code=422)

    try:
        stock_list = [result for result in cursor]
    except KeyError:
        raise HTTPException(detail="Error while searching.", status_code=500)

    return {"stocks": stock_list, "count": count}
