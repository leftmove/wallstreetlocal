from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel

import json
import logging
from datetime import datetime
from urllib import parse

from worker import tasks as worker
from routers import filer

from .lib import database
from .lib import analysis
from .lib import web

from .lib.api import sec_filer_search
from .lib.cache import cache
from .lib.errors import report_error


production_environment = getattr(worker, "production_environment", False)


class HTTPError(BaseModel):
    detail: str


router = APIRouter(
    prefix="/filing",
    tags=["filing"],
    responses={
        200: {"model": HTTPError, "description": "Success."},
        404: {"description": "Not found"},
    },
)


@router.get(
    "/query",
    tags=["filing"],
    status_code=201,
)
async def query_filer(
    cik: str, access_number: str, background: BackgroundTasks = BackgroundTasks
):
    filing = database.find_filing(cik, access_number, {"_id": 1})
    if not filing:
        try:
            sec_data = sec_filer_search(cik)
        except Exception as e:
            logging.error(e)
            raise HTTPException(404, detail="CIK not found.")

        if production_environment:
            worker.create_filer.delay(cik, sec_data)
        else:
            background.add_task(filer.create_filer, cik, sec_data)

        return {"status": "Filing creation started."}
    else:

        if filing["form"] not in database.holding_forms:
            raise HTTPException(404, detail="Filing type not supported.")

        return update_filing({"cik": cik})


# Exact functionality as `update_filer`, so changes need to be synced


def update_filing(filing, background: BackgroundTasks = BackgroundTasks):
    cik = filing["cik"]
    time = datetime.now().timestamp()

    operation = database.find_log(cik)
    if operation is None:
        raise HTTPException(404, detail="Filing log not found.")
    elif (
        production_environment and operation["status"] == 2 or operation["status"] == 1
    ):
        raise HTTPException(  # @IgnoreException
            302, detail="Filing is partially building."
        )
    elif operation["status"] >= 2:
        raise HTTPException(409, detail="Filing still building.")

    update, last_report = web.check_new(cik)
    if not update:
        raise HTTPException(
            200, detail="Filing is already up to date."
        )  # @IgnoreException

    database.edit_status(cik, 1)
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    stamp = {"name": company["name"], "start": time}
    if production_environment:
        worker.create_historical.delay(cik, company, stamp)
    else:
        background.add_task(create_historical, cik, company, stamp)

    return {"description": "Filer update started."}


@cache(24)
@router.get("/record", tags=["filers", "filing", "records"], status_code=200)
async def record_filing(cik: str, access_number):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    filing = database.find_filing(cik, access_number)
    filename = f"wallstreetlocal-{cik}-{access_number}.json"
    file_path = analysis.create_json(filing, filename)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/recordcsv", tags=["filers", "filing", "records"], status_code=200)
async def record_filing_csv(cik: str, access_number: str, headers: str = None):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    if headers:
        try:
            headers_string = parse.unquote(headers)
            headers = json.loads(headers_string)
            headers_string = headers_string + f"-{access_number}"
            header_hash = hash(headers_string)
            file_name = f"wallstreetlocal-{cik}{header_hash}.csv"
        except Exception as e:
            report_error(cik, e)
            raise HTTPException(
                status_code=422, detail="Malformed headers, unable to process request."
            )
    else:
        file_name = f"wallstreetlocal-{cik}-{access_number}.csv"

    filing = database.find_filing(cik, access_number)
    stock_dict = filing["stocks"]
    stock_list = [stock_dict[cusip] for cusip in stock_dict]

    file_path, filename = analysis.create_csv(stock_list, file_name, headers)
    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@router.get("/info", status_code=200)
async def query_filings(cik: str):
    pipeline = [
        {"$match": {"cik": cik, "form": "13F-HR"}},
        {"$project": {"stocks": 0, "_id": 0}},
    ]
    cursor = database.search_filings(pipeline)
    if not cursor:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filings = [result for result in cursor]

    return {"filings": filings}
