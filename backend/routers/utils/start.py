import motor.motor_asyncio

from .mongo import *
from .search import *

from tqdm import tqdm

# pyright: reportGeneralTypeIssues=false
# pyright: reportUnboundVariable=false


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

    db_empty = True if companies.count_documents({}) == 0 else False
    search_empty = (
        True
        if "companies" not in [index.uid for index in search.get_indexes()]
        else False
    )

    if search_empty:
        print("[ Search (Meilisearch) Loading ] ...")
        companies_index = search.create_index("companies", {"primaryKey": "cik"})

    if db_empty:
        print("[ Database (MongoDB) Loading ] ...")

    if db_empty or search_empty:
        backup_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_BACKUP_URL)
        companies_backup = backup_client["wallstreetlocal"]["companies"]

        cursor = companies_backup.find()
        for company in zip(cursor, tqdm(range(companies_backup.count()))):
            if db_empty:
                companies.insert_one(company)
            if search_empty:
                companies_index.add_documents([company])

    if search_empty:
        print("[ Search (Meilisearch) Loaded ]")
    if db_empty:
        print("[ Database (MongoDB) Loaded ]")
