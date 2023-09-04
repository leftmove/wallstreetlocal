import asyncio


import motor.motor_asyncio
from tqdm import tqdm

from .utils.mongo import *
from .utils.search import *


# pyright: reportGeneralTypeIssues=false
# pyright: reportUnboundVariable=false


async def main():
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

    db_empty = True if await companies.count_documents({}) == 0 else False
    search_empty = (
        True if companies_index.get_stats().number_of_documents == 0 else False
    )

    if search_empty:
        print("[ Search (Meilisearch) Loading ] ...")

    if db_empty:
        print("[ Database (MongoDB) Loading ] ...")

    if db_empty or search_empty:
        backup_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_BACKUP_URL)
        companies_backup = backup_client["wallstreetlocal"]["companies"]
        companies_count = await companies_backup.count_documents({})

        batch = 4000
        i = 0
        documents = []

        progress = tqdm(
            total=companies_count, desc="Loading Documents", unit="document"
        )
        cursor = companies_backup.find({})
        async for document in cursor:
            if i < batch:
                del document["_id"]
                documents.append(document)
            else:
                if db_empty:
                    try:
                        companies.insert_many(documents)
                    except:
                        pass
                if search_empty:
                    try:
                        companies_index.add_documents(documents)
                    except:
                        pass
                progress.update(batch)
                documents = []
                i = 0
            i += 1

        if documents != []:
            if db_empty:
                companies.insert_many(documents)
            if search_empty:
                companies_index.add_documents(documents)
            progress.update(companies_count % batch)

        if search_empty:
            companies_index.update_displayed_attributes(
                [
                    "name",
                    "cik",
                    "tickers",
                ]
            )
            companies_index.update_searchable_attributes(["name", "tickers", "cik"])
            companies_index.update_filterable_attributes(["13f"])

        progress.close()

        # companies_path = "./static"
        # if search_empty:
        #     with open(f"{companies_path}/companies.json", "w+") as f:
        #         progress = tqdm(
        #             total=companies_count, desc="Pulling Index", unit="document"
        #         )
        #         cursor = companies_backup.find({})

        #         f.write("[")
        #         i = 1
        #         async for document in cursor:
        #             if i != 1:
        #                 f.write(",")
        #             f.write(dumps(document))
        #             i += 1
        #             progress.update(1)
        #         f.write("]")

        #         progress.close()

        #     with open(f"{companies_path}/companies.json", "r") as f:
        #         progress = tqdm(
        #             total=companies_count,
        #             desc="Inserting Search Documents",
        #             unit="document",
        #         )

        #         company_json = json.load(f)
        #         batch = 4000
        #         batch_remainer = companies_count % batch
        #         for i in range(companies_count // batch):
        #             sliced_batch = company_json[i * batch : (i + 1) * batch]
        #             companies_index.add_documents(sliced_batch)
        #             progress.update(batch)

        #         sliced_batch = company_json[companies_count - batch_remainer : -1]
        #         companies_index.add_documents(sliced_batch)
        #         progress.update(batch_remainer)

        #         progress.close()

        # if db_empty:
        #     with open(f"{companies_path}/companies.bson", "ab") as f:
        #         progress = tqdm(
        #             total=companies_count,
        #             desc="Pulling Database Documents",
        #             unit="document",
        #         )
        #         cursor = companies_backup.find({})

        #         async for document in cursor:
        #             document_bson = bson.BSON.encode(document)
        #             f.write(document_bson)
        #             progress.update(1)

        #         progress.close()

        #     with open(f"{companies_path}/companies.bson", "rb") as f:
        #         progress = tqdm(
        #             total=companies_count,
        #             desc="Inserting Database Documents",
        #             unit="document",
        #         )

        #         company_bson = bson.BSON(f.read())
        #         for document in company_bson:
        #             companies.insert_one(document)
        #             progress.update(1)

        #         progress.close()

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


def initialize():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        loop.create_task(main())
    else:
        asyncio.run(main())
