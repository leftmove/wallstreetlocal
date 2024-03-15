import meilisearch

import os
import logging
import time


MEILI_SERVER_URL = f'http://{os.environ["MEILI_SERVER_URL"]}:7700'
MEILI_MASTER_KEY = os.environ["MEILI_MASTER_KEY"]
logging.info("[ Search (Meilisearch) Initializing ] ...")

search = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
if "companies" not in [index.uid for index in search.get_indexes()["results"]]:
    search.create_index("companies", {"primaryKey": "cik"})
    time.sleep(3)
    search = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
companies_index = search.index("companies")
companies_index.update_displayed_attributes(
    [
        "name",
        "cik",
        "tickers",
    ]
)
companies_index.update_searchable_attributes(["name", "tickers", "cik"])
companies_index.update_filterable_attributes(["thirteen_f"])


def search_companies(query, options={}):
    result = companies_index.search(query, options)
    hits = result["hits"]

    return hits


logging.info("[ Search (Meilisearch) Initialized ]")
