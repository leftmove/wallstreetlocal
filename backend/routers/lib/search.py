import meilisearch_python_sdk as meilisearch

import os

from . import errors

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False

MEILI_SERVER_URL = os.environ.get("MEILI_SERVER_URL", "http://search:7700")
MEILI_MASTER_KEY = os.environ.get(
    "MEILI_MASTER_KEY", "qq80RvopBK1kjvdlSVG_8VaxsRZICP0uniq5F2v0nlM"
)


def _prepare_meilisearch():
    client = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
    companies_index = client.index("companies")
    indexes = client.get_indexes()
    if not indexes or "companies" not in [index.uid for index in indexes]:
        client.create_index("companies", "cik")
    try:
        companies_index.update(primary_key="cik")
        companies_index.update_displayed_attributes(
            [
                "name",
                "cik",
                "tickers",
            ]
        )
        companies_index.update_searchable_attributes(["name", "tickers", "cik"])
        companies_index.update_filterable_attributes(["thirteen_f"])
    except Exception as e:
        errors.report_error(e)


_prepare_meilisearch()
search = meilisearch.Client(MEILI_SERVER_URL, MEILI_MASTER_KEY)
companies_index = search.index("companies")


def ping():
    try:
        keys = search.get_keys()
    except Exception as e:
        errors.report_error("Meilisearch Startup", e)
        raise e
    return keys


def companies_stats():
    stats = companies_index.get_stats()
    return stats


def add_companies(companies: list, primary_key="cik"):
    task = companies_index.update_documents(companies, primary_key)
    return task


async def search_companies(query, limit, filter):
    result = companies_index.search(query, limit=limit, filter=filter)
    hits = result.hits

    return hits
