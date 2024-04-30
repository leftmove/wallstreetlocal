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
    companies_count = 853_000

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

    print("Deleting In-Progress Filers ...")
    in_progress_logs = logs.find({"status": {"$gt": 0}}, {"cik": 1})
    in_progress = [log["cik"] for log in in_progress_logs]

    logs.delete_many({"cik": {"$in": in_progress}})
    filers.delete_many({"cik": {"$in": in_progress}})

    print("Deleting Empty Logs ...")
    log_ciks = [log["cik"] for log in logs.find({}, {"cik": 1})]
    log_filers = [
        filer["cik"] for filer in filers.find({"cik": {"$in": log_ciks}}, {"cik": 1})
    ]
    log_ciks = list(set(log_ciks) - set(log_filers))
    logs.delete_many({"cik": {"$in": log_ciks}})

    print("Setting Up Environment ...")
    ENVIRONMENT = os.environ["ENVIRONMENT"]
    production_environment = True if ENVIRONMENT == "production" else False

    if not production_environment:
        DEBUG_CIK = os.environ.get("DEBUG_CIK", "")

        filer_query = {"cik": DEBUG_CIK}

        logs.delete_one(filer_query)
        filers.delete_one(filer_query)
        filings.delete_many(filer_query)
