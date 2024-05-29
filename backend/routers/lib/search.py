import meilisearch_python_sdk

import os

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False
if not production_environment:
    from dotenv import load_dotenv

    load_dotenv(".env")

MEILI_SERVER_URL = os.environ["MEILI_SERVER_URL"]
MEILI_MASTER_KEY = os.environ["MEILI_MASTER_KEY"]


def _prepare_meilisearch():
    client = meilisearch_python_sdk.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
    companies_index = client.index("companies")
    indexes = client.get_indexes()
    if not indexes or "companies" not in [index.uid for index in indexes]:
        client.create_index("companies", primary_key="cik")
    companies_index.update_displayed_attributes(
        [
            "name",
            "cik",
            "tickers",
        ]
    )
    companies_index.update_searchable_attributes(["name", "tickers", "cik"])
    companies_index.update_filterable_attributes(["thirteen_f"])


_prepare_meilisearch()
search = meilisearch_python_sdk.AsyncClient(MEILI_SERVER_URL, MEILI_MASTER_KEY)
companies_index = search.index("companies")


async def search_companies(query, limit, filter):
    result = await companies_index.search(query, limit=limit, filter=filter)
    hits = result.hits

    return hits
