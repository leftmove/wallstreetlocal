from fastapi import HTTPException, APIRouter, BackgroundTasks
from pydantic import BaseModel

from .lib import web
from .lib import database
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
        pipeline = [
            {"$match": {"cik": cik}},
            {"$unwind": "$stocks"},
            {"$replaceRoot": {"newRoot": "$stocks"}},
            {"$group": {"_id": "$cusip", "doc": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$doc"}},
        ]
        if limit < 0:
            raise HTTPException(detail="Invalid search requirements.", status_code=422)
        if not sold:
            pipeline.append({"$match": {"sold": False}})
        if not unavailable:
            pipeline.append({"$match": {sort: {"$ne": "NA"}}})

        cursor = database.search_filers(pipeline)
        if not cursor:
            raise HTTPException(detail="Filer not found.", status_code=404)

        results = [r for r in cursor]
        if not results:
            raise HTTPException(detail="No stocks found.", status_code=404)
        count = len(results)

        pipeline.extend(
            [
                {"$sort": {sort: 1 if reverse else -1, "_id": 1}},
                {"$project": {"_id": 0}},
                {"$skip": offset},
                {"$limit": limit},
            ]
        )
        cursor = database.search_filers(pipeline)
    except Exception as e:
        raise HTTPException(detail="Invalid search requirements.", status_code=422)

    if cursor == None:
        raise HTTPException(detail="Filer not found.", status_code=404)

    try:
        stock_list = [result for result in cursor]
    except KeyError:
        raise HTTPException(detail="Filer not found.", status_code=404)

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
async def query_filing(cik: str, access_number: str):

    filer_query = f"filings.{access_number}.stocks"
    filer = database.find_filer(cik, {filer_query: 1})
    if not filer:
        raise HTTPException(detail="Filer not found.", status_code=404)

    filings = filer["filings"]
    filing = filings[access_number]
    stocks = filing["stocks"]

    return {"stocks": stocks}
