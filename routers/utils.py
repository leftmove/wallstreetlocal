from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Match
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.types import ASGIApp

import time
import logging
import meilisearch
import requests
import json
import os
import redis

from tqdm import tqdm
from datetime import datetime
from traceback import format_exc
from pymongo import MongoClient
from typing import Tuple

# INFO = Gauge("fastapi_app_info", "FastAPI application information.", ["app_name"])
# REQUESTS = Counter(
#     "fastapi_requests_total",
#     "Total count of requests by method and path.",
#     ["method", "path", "app_name"],
# )
# RESPONSES = Counter(
#     "fastapi_responses_total",
#     "Total count of responses by method, path and status codes.",
#     ["method", "path", "status_code", "app_name"],
# )
# REQUESTS_PROCESSING_TIME = Histogram(
#     "fastapi_requests_duration_seconds",
#     "Histogram of requests processing time by path (in seconds)",
#     ["method", "path", "app_name"],
# )
# EXCEPTIONS = Counter(
#     "fastapi_exceptions_total",
#     "Total count of exceptions raised by path and exception type",
#     ["method", "path", "exception_type", "app_name"],
# )
# REQUESTS_IN_PROGRESS = Gauge(
#     "fastapi_requests_in_progress",
#     "Gauge of requests by method and path currently being processed",
#     ["method", "path", "app_name"],
# )


# class PrometheusMiddleware(BaseHTTPMiddleware):
#     def __init__(self, app: ASGIApp, app_name: str = "fastapi-app") -> None:
#         super().__init__(app)
#         self.app_name = app_name
#         INFO.labels(app_name=self.app_name).inc()

#     async def dispatch(
#         self, request: Request, call_next: RequestResponseEndpoint
#     ) -> Response:
#         method = request.method
#         path, is_handled_path = self.get_path(request)

#         if not is_handled_path:
#             return await call_next(request)

#         REQUESTS_IN_PROGRESS.labels(
#             method=method, path=path, app_name=self.app_name
#         ).inc()
#         REQUESTS.labels(method=method, path=path, app_name=self.app_name).inc()
#         before_time = time.perf_counter()
#         try:
#             response = await call_next(request)
#         except BaseException as e:
#             status_code = HTTP_500_INTERNAL_SERVER_ERROR
#             EXCEPTIONS.labels(
#                 method=method,
#                 path=path,
#                 exception_type=type(e).__name__,
#                 app_name=self.app_name,
#             ).inc()
#             raise e from None
#         else:
#             status_code = response.status_code
#             after_time = time.perf_counter()
#             # retrieve trace id for exemplar
#             span = trace.get_current_span()
#             trace_id = trace.format_trace_id(span.get_span_context().trace_id)

#             REQUESTS_PROCESSING_TIME.labels(
#                 method=method, path=path, app_name=self.app_name
#             ).observe(after_time - before_time, exemplar={"TraceID": trace_id})
#         finally:
#             RESPONSES.labels(
#                 method=method,
#                 path=path,
#                 status_code=status_code,
#                 app_name=self.app_name,
#             ).inc()
#             REQUESTS_IN_PROGRESS.labels(
#                 method=method, path=path, app_name=self.app_name
#             ).dec()

#         return response

#     @staticmethod
#     def get_path(request: Request) -> Tuple[str, bool]:
#         for route in request.app.routes:
#             match, child_scope = route.matches(request.scope)
#             if match == Match.FULL:
#                 return route.path, True

#         return request.url.path, False


# class EndpointFilter(logging.Filter):
#     def filter(self, record: logging.LogRecord) -> bool:
#         return record.getMessage().find("GET /metrics") == -1


# def metrics(request: Request) -> Response:
#     return Response(
#         generate_latest(REGISTRY), headers={"Content-Type": CONTENT_TYPE_LATEST}
#     )


# def setting_otlp(
#     app: ASGIApp, app_name: str, endpoint: str, log_correlation: bool = True
# ) -> None:

#     resource = Resource.create(
#         attributes={"service.name": app_name, "compose_service": app_name}
#     )

#     tracer = TracerProvider(resource=resource)
#     trace.set_tracer_provider(tracer)

#     tracer.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint)))

#     if log_correlation:
#         LoggingInstrumentor().instrument(set_logging_format=True)

#     FastAPIInstrumentor.instrument_app(app, tracer_provider=tracer)


def download_file_from_google_drive(file_id, destination, chunk_size=32768):
    url = "https://drive.usercontent.google.com/download"

    session = requests.Session()
    params = {"id": file_id, "confirm": 1, "export": "download"}
    response = session.get(url, params=params, stream=True)

    save_response_content(response, destination, chunk_size)


def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value

    return None


def save_response_content(response, destination, chunk_size):
    with open(destination, "wb") as f:
        size = int(response.headers["Content-Length"]) / (10**6)
        mb_chunk = chunk_size / (10**6)
        progress = tqdm(total=size, desc="Downloading Database", unit="mb")
        for i, chunk in enumerate(response.iter_content(chunk_size)):
            if chunk:
                f.write(chunk)
                if (i * mb_chunk) < size:
                    progress.update(mb_chunk)
        progress.close()


def create_error(e):
    stamp = str(datetime.now())
    cwd = os.getcwd()
    with open(f"{cwd}/static/errors/error-start-{stamp}.log", "w") as f:
        error_string = f"Error Occurred During Start\n{repr(e)}\n{format_exc()}"
        f.write(error_string)


def initialize():
    print(
        r"""
|---------------------------------------------|
    __               __                  __    
   / /_  ____ ______/ /_____  ____  ____/ /    
  / __ \/ __ `/ ___/ //_/ _ \/ __ \/ __  /     
 / /_/ / /_/ / /__/ ,< /  __/ / / / /_/ /      
/_.___/\__,_/\___/_/|_|\___/_/ /_/\__,_/       
         ______           __  ___    ____  ____
        / ____/___ ______/ /_/   |  / __ \/  _/
       / /_  / __ `/ ___/ __/ /| | / /_/ // /  
      / __/ / /_/ (__  ) /_/ ___ |/ ____// /   
     /_/    \__,_/____/\__/_/  |_/_/   /___/   
     
|---------------------------------------------|
    """
    )

    MONGO_SERVER_URL = os.environ["MONGO_SERVER_URL"]
    MONGO_BACKUP_URL = os.environ["MONGO_BACKUP_URL"]

    client = MongoClient(MONGO_SERVER_URL)
    filers = client["wallstreetlocal"]["filers"]
    filings = client["wallstreetlocal"]["filings"]
    logs = client["wallstreetlocal"]["logs"]
    companies = client["wallstreetlocal"]["companies"]
    companies_count = 852491

    MEILI_SERVER_URL = os.environ["MEILI_SERVER_URL"]
    MEILI_MASTER_KEY = os.environ["MEILI_MASTER_KEY"]

    try:
        retries = 3
        while retries:
            search = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
            search.create_index("companies", {"primaryKey": "cik"})
            companies_index = search.index("companies")
            companies_index.add_documents([{"cik": "TEST"}])
            retries -= 1
        raise RuntimeError  # @IgnoreException
    except:
        search = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
        companies_index = search.index("companies")

    REDIS_SERVER_URL = os.environ["REDIS_SERVER_URL"]
    REDIS_PORT = int(os.environ.get("REDIS_PORT", 14640))
    logging.info("[ Cache (Redis) Initializing ] ...")

    store = redis.Redis(
        host=REDIS_SERVER_URL,
        port=REDIS_PORT,
        decode_responses=True,
    )

    search.get_keys()
    companies_index.update(primary_key="cik")

    db_empty = True if companies.count_documents({}) == 0 else False
    search_empty = (
        True if companies_index.get_stats().number_of_documents == 1 else False
    )
    backup_path = "./static/backup"

    store.flushall()

    def insert_database(document_list):
        try:
            companies.insert_many(document_list)
        except Exception as e:
            create_error(e)
            print("Error Occured")

    def insert_search(document_list):
        try:
            companies_index.add_documents(document_list, "cik")
        except Exception as e:
            create_error(e)
            print("Error Occured")

    if search_empty:
        print("[ Search (Meilisearch) Loading ] ...")

    if db_empty:
        print("[ Database (MongoDB) Loading ] ...")

    if db_empty or search_empty:
        file_path = f"{backup_path}/companies.bson"
        download_file_from_google_drive(MONGO_BACKUP_URL, file_path)

        batch = 4000
        database_documents = []
        search_documents = []
        progress = tqdm(
            total=companies_count, desc="Loading Documents", unit="document"
        )
        companies_bson = open(file_path, "rb")

        for line in companies_bson:
            document = json.loads(line.rstrip())
            document.pop("_id", None)

            database_count = len(database_documents)
            search_count = len(search_documents)

            if db_empty:
                database_documents.append(document)

                if database_count >= batch:
                    insert_database(database_documents)
                    progress.update(database_count)
                    database_documents = []

            if search_empty:
                search_documents.append(
                    {
                        "name": document.get("name"),
                        "tickers": document.get("tickers"),
                        "cik": document.get("cik"),
                        "thirteen_f": document.get("thirteen_f"),
                    }
                )

                if search_count >= batch:
                    insert_search(search_documents)
                    progress.update(search_count)
                    search_documents = []

        database_count = len(database_documents)
        search_count = len(search_documents)

        if search_empty and search_count:
            insert_search(search_documents)
            progress.update(search_count)
            search_documents = []
        if db_empty and database_count:
            insert_database(database_documents)
            progress.update(database_count)
            database_documents = []

        if search_empty:
            companies_index.update_displayed_attributes(
                [
                    "name",
                    "cik",
                    "tickers",
                ]
            )
            companies_index.update_searchable_attributes(["name", "tickers", "cik"])
            companies_index.update_filterable_attributes(["thirteen_f"])

        progress.close()
        companies_bson.close()

    if search_empty:
        print("[ Search (Meilisearch) Loaded ]")
    if db_empty:
        print("[ Database (MongoDB) Loaded ]")

    ENVIRONMENT = os.environ["ENVIRONMENT"]
    production_environment = True if ENVIRONMENT == "production" else False

    if not production_environment:
        DEBUG_CIK = os.environ.get("DEBUG_CIK", "")

        filer_query = {"cik": DEBUG_CIK}

        logs.delete_one(filer_query)
        filers.delete_one(filer_query)
        filings.delete_many(filer_query)

        in_progress_logs = logs.find({"status": {"$gt": 0}}, {"cik": 1})
        in_progress = [l["cik"] for l in in_progress_logs]

        logs.delete_many({"cik": {"$in": in_progress}})
        filers.delete_many({"cik": {"$in": in_progress}})
