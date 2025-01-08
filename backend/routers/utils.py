import logging
import requests
import json
import os
import threading

from tqdm import tqdm
from dotenv import load_dotenv

import uvicorn

import sentry_sdk
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.pymongo import PyMongoIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

from worker import tasks as queue

from .lib import errors
from .lib import database
from .lib import search
from .lib import cache

from .lib.database import MONGO_BACKUP_URL
from .lib.errors import SENTRY_DSN

load_dotenv()

DEBUG_CIK = os.environ.get("DEBUG_CIK", "")
TELEMETRY = bool(os.environ.get("TELEMETRY", False))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False
run_telemetry = True if TELEMETRY else False

log = logging.getLogger("uvicorn.access")
log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"][
    "fmt"
] = "%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] - %(message)s"

if production_environment and run_telemetry:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        enable_tracing=True,
        integrations=[
            RedisIntegration(),
            PyMongoIntegration(),
            LoggingIntegration(level=logging.INFO, event_level=logging.INFO),
        ],
    )


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
        size = 530
        mb_chunk = chunk_size / (10**6)
        progress = tqdm(total=size, desc="Downloading Database", unit="mb")
        for i, chunk in enumerate(response.iter_content(chunk_size)):
            if chunk:
                f.write(chunk)
                if (i * mb_chunk) < size:
                    progress.update(mb_chunk)
    progress.close()


def start_worker(queue=queue):
    worker = queue.Worker()
    worker.start()


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

    database.ping()
    search.ping()
    cache.ping()

    companies_count = 853_000
    database_count = database.companies_count()
    search_count = search.companies_stats().number_of_documents

    cache.flush_all()

    db_empty = True if database.companies_count() == 0 else False
    search_empty = True if search.companies_stats().number_of_documents <= 1 else False
    backup_path = "./static/backup"

    def insert_database(document_list: list):
        try:
            database.add_companies(document_list)
        except Exception as e:
            errors.report_error("MongoDB Database", e)
            print("Error Occurred")

    def insert_search(document_list: list):
        try:
            database.add_companies(document_list)
        except Exception as e:
            errors.report_error("Meilisearch Database", e)
            print("Error Occurred")

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
                document_cik = document.get("cik")
                if document_cik:
                    search_documents.append(
                        {
                            "name": document.get("name"),
                            "cik": document_cik,
                            "tickers": document.get("tickers"),
                            "thirteen_f": document.get("thirteen_f"),
                        }
                    )
                else:
                    print("Document Missing CIK", document)

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

        if db_empty and database_count and search_empty and search_count:
            progress.update(database_count)
        elif db_empty and database_count:
            progress.update(database_count)
        elif search_empty and search_count:
            progress.update(search_count)

        if search_empty:
            search._prepare_meilisearch()

        progress.close()
        companies_bson.close()

    if search_empty:
        print("[ Search (Meilisearch) Loaded ]")
    if db_empty:
        print("[ Database (MongoDB) Loaded ]")

    print("Deleting In-Progress Filers ...")
    in_progress_logs = database.find_logs({"status": {"$gt": 0}}, {"cik": 1})
    in_progress = [log.get("cik", None) for log in in_progress_logs]
    database.delete_filers({"cik": {"$in": in_progress}})

    print("Deleting Empty Logs ...")
    log_ciks = list(
        filter(lambda x: x, [log.get("cik", None) for log in database.find_logs({})])
    )
    log_filers = [
        filer["cik"]
        for filer in database.find_filers({"cik": {"$in": log_ciks}}, {"cik": 1})
    ]
    log_ciks = list(set(log_ciks) - set(log_filers))
    database.delete_logs({"cik": {"$in": log_ciks}})

    print("Cleaning Errors ...")
    errors.cleanup_errors()

    print("Retrieving Filer Lists ...")
    cwd = os.getcwd()
    try:
        r = requests.get(
            "https://gist.githubusercontent.com/leftmove/1e96a95bad8e590a440e37f07d305d2a/raw/wallstreetlocal-top-filers.json"
        )

        data = r.json()
        top_ciks_path = f"{cwd}/static/top.json"
        with open(top_ciks_path, "w") as f:
            json.dump(data, f)
    except Exception as e:
        errors.report_error("Gist Loading", e)
    try:
        r = requests.get(
            "https://gist.githubusercontent.com/leftmove/daca5d470c869e9d6f14c298af809f9f/raw/wallstreetlocal-popular-filers.json"
        )

        data = r.json()
        popular_ciks_path = f"{cwd}/static/popular.json"
        with open(popular_ciks_path, "w") as f:
            json.dump(data, f)
    except Exception as e:
        errors.report_error("Gist Loading", e)

    print("Calculating Statistics ...")
    create_latest = database.find_statistics(
        {"type": "create-latest", "completion": {"$exists": True}}
    )
    results = [result for result in create_latest]
    latest_completions = [result["completion"] for result in results]
    if latest_completions:
        latest_total = sum(latest_completions)
        latest_count = len(latest_completions)
        latest_average = latest_total / latest_count
        latest_stat = {
            "count": latest_count,
            "total": latest_total,
            "average": latest_average,
        }
    else:
        latest_stat = {
            "count": 0,
            "total": 0,
            "average": 0,
        }

    create_historical = database.find_statistics(
        {"type": "create-historical", "completion": {"$exists": True}}
    )
    results = [result for result in create_historical]
    historical_completions = [result["completion"] for result in results]
    if historical_completions:
        historical_total = sum(historical_completions)
        historical_count = len(historical_completions)
        historical_average = historical_total / historical_count
        historical_stat = {
            "count": historical_count,
            "total": historical_total,
            "average": historical_average,
        }
    else:
        historical_stat = {
            "count": 0,
            "total": 0,
            "average": 0,
        }

    statistic = {
        "latest": latest_stat,
        "historical": historical_stat,
    }
    with open(f"{cwd}/static/statistics.json", "w") as s:
        json.dump(statistic, s, indent=6)

    print("Done!")
