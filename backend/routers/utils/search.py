import meilisearch

from dotenv import load_dotenv
from os import getenv

from .mongo import *

load_dotenv()

# pyright: reportGeneralTypeIssues=false

MEILISEARCH_SERVER_URL = getenv("MEILISEARCH_SERVER_URL")
MEILISEARCH_MASTER_KEY = getenv("MEILISEARCH_MASTER_KEY")
MONGO_BACKUP_URL = getenv("MONGO_BACKUP_URL")
print("[ Search (Meilisearch) Initializing ] ...")

search = meilisearch.Client(MEILISEARCH_SERVER_URL, MEILISEARCH_MASTER_KEY)
if "companies" not in [index.uid for index in search.get_indexes()["results"]]:
    search.create_index("companies", {"primaryKey": "cik"})
    companies_index = search.get_index("companies")
else:
    companies_index = search.get_index("companies")


async def search_companies(query, options={}):
    result = companies_index.search(query, options)
    hits = result["hits"]

    return hits


print("[ Search (Meilisearch) Initialized ]")
