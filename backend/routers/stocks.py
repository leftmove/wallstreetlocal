from fastapi import HTTPException, APIRouter, BackgroundTasks
from pydantic import BaseModel

import logging

from routers.responses import BrowserCachedResponse

from .lib import web
from .lib import database
from .lib import analysis
from .lib import errors
from .lib.cache import cache

router = APIRouter(
    prefix="/stocks",
    tags=["stocks"],
    responses={},
)

cache_time = (60 * 10) / (60 * 60)  # 10 minutes


class Cusip(BaseModel):
    cusip: list


@router.get("/query", tags=["stocks"], status_code=200)
@cache(2)
async def query_stocks(cik: str, background: BackgroundTasks):
    if cik:
        filer = database.search_filer(cik, {"stocks.cusip": 1})
        if not filer:
            raise HTTPException(status_code=404, detail="Filer not found")
        tickers = [stock["cusip"] for stock in filer["stocks"]]

        found_stocks = database.find_stocks("ticker", {"$in": tickers})
        background.add_task(web.query_stocks, found_stocks)  # pyright: ignore

    return {"description": "Stocks started updating."}


@router.get("/filer", tags=["stocks", "filers"], status_code=200)
@cache(2)
async def stock_filer(
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
    except LookupError as e:
        errors.report_error(cik, e)
        raise HTTPException(detail="No results found.", status_code=422)
    except Exception as e:
        errors.report_error(cik, e)
        cursor = []
        count = 0

    try:
        stock_list = [result for result in cursor]
    except KeyError:
        raise HTTPException(detail="Error while searching.", status_code=500)

    return BrowserCachedResponse(
        content={"stocks": stock_list, "count": count}, cache_hours=cache_time
    )


@router.get("/filing", tags=["stocks", "filings"], status_code=200)
@cache(2)
async def stock_filing(
    cik: str,
    access_number: str,
    limit: int,
    offset: int,
    sort: str,
    sold: bool,
    reverse: bool,
    unavailable: bool,
    projections = ["changes"]
):
    filer = database.find_filer(cik, {"_id": 1})
    if not filer:
        raise HTTPException(detail="Filer not found.", status_code=404)

    try:
        pipeline, count = analysis.sort_pipeline(
            cik,
            limit,
            offset,
            sort,
            sold,
            reverse,
            unavailable,
            stock_structure="dict",
            collection_search=database.search_filings,
            project=projections,
            match_query={
                "access_number": access_number,
                "stocks": {"$exists": True},
            },
        )
        cursor = database.search_filings(pipeline)
    except LookupError as e:
        errors.report_error(cik, e)
        raise HTTPException(detail="No results found.", status_code=422)
    except Exception as e:
        errors.report_error(cik, e)
        cursor = []
        count = 0

    try:
        stock_list = [result for result in cursor]
    except KeyError:
        raise HTTPException(detail="Error while searching.", status_code=500)

    return BrowserCachedResponse(
        content={"stocks": stock_list, "count": count}, cache_hours=cache_time
    )


@router.get("/timeseries", tags=["stocks", "filers"], status_code=200)
@cache(4)
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

    return BrowserCachedResponse(content={"stocks": stock_list}, cache_hours=cache_time)


# @router.get("/changes", status_code=200)
# async def stock_changes(
#     cik: str,
#     access_number: str,
#     limit: int,
#     offset: int,
#     sort: str,
#     sold: bool,
#     reverse: bool,
#     unavailable: bool,
# ):
#     filer = database.find_filer(cik, {"_id": 1})
#     if not filer:
#         raise HTTPException(detail="Filer not found.", status_code=404)

#     try:
#         pipeline, count = analysis.sort_pipeline(
#             cik,
#             limit,
#             offset,
#             sort,
#             sold,
#             reverse,
#             unavailable,
#             stock_structure="dict",
#             collection_search=database.search_filings,
#             match_query={
#                 "access_number": access_number,
#                 "stocks": {"$exists": True},
#             },
#         )
#         cursor = database.search_filings(pipeline)
#     except LookupError as e:
#         errors.report_error(cik, e)
#         raise HTTPException(detail="No results found.", status_code=422)
#     except Exception as e:
#         errors.report_error(cik, e)
#         cursor = []
#         count = 0

#     try:
#         stock_list = [result for result in cursor]
#     except KeyError:
#         raise HTTPException(detail="Error while searching.", status_code=500)

#     return BrowserCachedResponse(
#         content={"stocks": new_list, "count": count}, cache_hours=cache_time
#     )
