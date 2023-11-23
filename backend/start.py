import uvicorn
from tqdm import tqdm
from dotenv import load_dotenv
from os import getenv
from datetime import datetime
import time
import bson

from pymongo import MongoClient
import meilisearch

load_dotenv()


def main():
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

    MONGO_SERVER_URL = getenv("MONGO_SERVER_URL")

    client = MongoClient(MONGO_SERVER_URL)
    companies = client["wallstreetlocal"]["companies"]
    companies_count = 852491

    MEILISEARCH_SERVER_URL = f'http://{getenv("MEILISEARCH_SERVER_URL")}:7700'
    MEILISEARCH_MASTER_KEY = getenv("MEILISEARCH_MASTER_KEY")

    try:
        retries = 3
        while retries:
            search = meilisearch.Client(MEILISEARCH_SERVER_URL, MEILISEARCH_MASTER_KEY)
            search.create_index("companies")
            companies_index = search.index("companies")
            if "companies" not in [
                index.uid for index in search.get_indexes()["results"]
            ]:
                time.sleep(1)
                continue
            companies_index.add_documents([])
            retries -= 1
        raise RuntimeError
    except:
        time.sleep(3)
        search = meilisearch.Client(MEILISEARCH_SERVER_URL, MEILISEARCH_MASTER_KEY)
        companies_index = search.index("companies")

    db_empty = True if companies.count_documents({}) == 0 else False
    search_empty = (
        True if companies_index.get_stats().number_of_documents == 0 else False
    )

    def insert_database(document_list):
        try:
            companies.insert_many(document_list)
        except Exception as e:
            stamp = str(datetime.now())
            with open(f"./public/backup/error-{stamp}.log", "w+") as f:
                f.write(str(e))
            print("Error Occured")

    def insert_search(document_list):
        try:
            companies_index.add_documents(document_list)
        except Exception as e:
            stamp = str(datetime.now())
            with open(f"./public/backup/error-{stamp}.log", "w+") as f:
                f.write(str(e))
            print("Error Occured")

    if search_empty:
        print("[ Search (Meilisearch) Loading ] ...")

    if db_empty:
        print("[ Database (MongoDB) Loading ] ...")

    if db_empty or search_empty:
        batch = 4000
        documents = []

        progress = tqdm(
            total=companies_count, desc="Loading Documents", unit="document"
        )
        companies_bson = open("./public/backup/companies.bson", "rb")

        for document in bson.decode_file_iter(companies_bson):
            if len(documents) < batch:
                del document["_id"]
                documents.append(document)
            else:
                if db_empty:
                    insert_database(documents)
                if search_empty:
                    insert_search(documents)

                progress.update(batch)
                documents = []

        if documents != []:
            if db_empty:
                insert_database(documents)
            if search_empty:
                insert_search(documents)
            progress.update(len(documents))
            documents = []

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

    if search_empty:
        print("[ Search (Meilisearch) Loaded ]")
    if db_empty:
        print("[ Database (MongoDB) Loaded ]")


# Below code is very clunky/hackish
# Leaving for now as it only runs once at startup
# Could use lots of work, as of now it uses
# a pretty roundabout method just to get async
# functions running
# TLDR: Fix later

workers = int(getenv("WORKERS"))  # type: ignore
port = 8000
host = "0.0.0.0"


def run(app):
    if workers == 1:
        uvicorn.run(app, host=host, port=port, forwarded_allow_ips="*", reload=True)
    else:
        uvicorn.run(app, host=host, port=port, forwarded_allow_ips="*", workers=workers)


# def initialize():
#     main()
#     # with daemon.DaemonContext():
#     #     main()

#     run("main:app")

#     # try:
#     #     loop = asyncio.get_running_loop()
#     # except RuntimeError:
#     #     loop = None

#     # if loop and loop.is_running():
#     #     loop.create_task(main())
#     # else:
#     #     asyncio.run(main())


if __name__ == "__main__":
    main()
    run("main:app")
