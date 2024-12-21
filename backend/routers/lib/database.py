import os
import logging

from dotenv import load_dotenv
from datetime import datetime
import time
import functools

import pymongo

load_dotenv()

MONGO_SERVER_URL = os.environ.get("MONGO_SERVER_URL", "mongodb://database:27017")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False


client = pymongo.MongoClient(MONGO_SERVER_URL)
db = client["wallstreetlocal"]

logs = db["logs"]
main = db["filers"]
stocks = db["stocks"]
filings = db["filings"]
companies = db["companies"]
statistics = db["statistics"]


def retry_on_rate_limit(max_attempts=5, start_sleep_time=1, backoff_factor=2):

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            sleep_time = start_sleep_time
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except pymongo.errors.BulkWriteError as e:
                    if "too many requests" in str(e).lower():
                        attempts += 1
                        time.sleep(sleep_time)
                        sleep_time *= backoff_factor
                    else:
                        raise
            raise RuntimeError(f"Max retry attempts reached for {func.__name__}")

        return wrapper

    return decorator


@retry_on_rate_limit()
def ping():
    server_status = client.server_info()
    return server_status


@retry_on_rate_limit()
def companies_count():
    count = companies.count_documents({})
    return count


@retry_on_rate_limit()
def check_stock(ticker):
    stock = stocks.find_one({"ticker": ticker})
    if stock is None:
        return False
    else:
        return True


@retry_on_rate_limit()
def search_stocks(pipeline):
    cursor = stocks.aggregate(pipeline)
    return cursor


@retry_on_rate_limit()
def find_stock(field, value):
    result = stocks.find_one({field: value})
    return result


@retry_on_rate_limit()
def find_stocks(field, value):
    results = stocks.find({field: value}, {"_id": 0})
    return results


@retry_on_rate_limit()
def edit_stock(query, value):
    stocks.update_one(query, value)


@retry_on_rate_limit()
def add_stock(stock):
    stocks.insert_one(stock)


@retry_on_rate_limit()
def find_filer(cik, project={"_id": 0}):
    result = main.find_one({"cik": cik}, project)
    return result


@retry_on_rate_limit()
def find_filers(query, project={"_id": 0}):
    results = main.find(query, project)
    return results


@retry_on_rate_limit()
def find_document(cik, project={"_id": 0}):
    result = main.find_one({"cik": cik}, project)
    return result


@retry_on_rate_limit()
def search_filers(pipeline):
    cursor = main.aggregate(pipeline)
    return cursor


@retry_on_rate_limit()
def search_filer(cik, project={"_id": 0}):
    cursor = main.aggregate(pipeline=[{"$match": {"cik": cik}}, {"$project": project}])
    try:
        result = cursor.next()
        return result
    except StopIteration:
        return None


@retry_on_rate_limit()
def add_filer(company):
    main.insert_one(company)


@retry_on_rate_limit()
def edit_filer(query, value):
    main.update_one(query, value)


@retry_on_rate_limit()
def delete_filer(cik):
    filer_query = {"cik": cik}
    logs.delete_many(filer_query)
    filings.delete_many(filer_query)
    main.delete_many(filer_query)


@retry_on_rate_limit()
def delete_filers(query):
    logs.delete_many(query)
    filings.delete_many(query)
    main.delete_many(query)


@retry_on_rate_limit()
def delete_filers(query):
    main.delete_many(query)


@retry_on_rate_limit()
def find_filing(cik, access_number, project={"_id": 0}, form_type="13F-HR"):
    result = filings.find_one(
        {"cik": cik, "access_number": access_number, "form": form_type}, project
    )
    return result


@retry_on_rate_limit()
def find_filings(cik, project={"_id": 0}, form_type="13F-HR"):
    cursor = filings.find({"cik": cik, "form": form_type}, project)
    results = [result for result in cursor]
    return results


@retry_on_rate_limit()
def map_filings(cik, key="access_number", project={"_id": 0}, form_type="13F-HR"):
    cursor = filings.find({"cik": cik, "form": form_type}, project)
    results = [result for result in cursor]
    results_dict = dict(zip([r[key] for r in results], results))
    return results_dict


@retry_on_rate_limit()
def search_filings(pipeline):
    cursor = filings.aggregate(pipeline)
    return cursor


@retry_on_rate_limit()
def add_filings(filing_list):
    filings.insert_many(filing_list)


@retry_on_rate_limit()
def edit_filing(query, value):
    filings.update_one(query, value)


@retry_on_rate_limit()
def delete_filings(cik):
    filings.delete_many({"cik": cik})


@retry_on_rate_limit()
def create_log(value):
    logs.insert_one(value)


@retry_on_rate_limit()
def find_log(cik, project={"_id": 0}):
    result = logs.find_one({"cik": cik}, project)
    return result


@retry_on_rate_limit()
def find_specific_log(query):
    result = logs.find_one(query)
    return result


max_logs = 100


@retry_on_rate_limit()
def add_log(cik, message, name="", identifier=""):
    if isinstance(message, dict):
        log_string = (
            f'{message["message"]}, ({message["name"]}) ({message["identifier"]})'
        )
        logs.update_one({"cik": cik}, {"$push": {"logs": log_string}})
    else:
        logs_string = [f"{log} ({name}) ({identifier})" for log in message.split("\n")]
        logs.update_one(
            {"cik": cik},
            {
                "$push": {"logs": {"$each": logs_string, "$slice": -max_logs}},
            },
        )


@retry_on_rate_limit()
def add_logs(cik, formatted_logs):
    logs_split = []
    for formatted_log in formatted_logs:
        logs_split.extend(
            [
                f"{log_message} ({formatted_log['name']}) ({formatted_log['identifier']})"
                for log_message in formatted_log["message"].split("\n")
            ]
        )

    logs.update_one(
        {"cik": cik},
        {"$push": {"logs": {"$each": logs_split, "$slice": -max_logs}}},
    )


@retry_on_rate_limit()
def edit_log(cik, stamp):
    logs.update_one({"cik": cik}, {"$set": stamp})


@retry_on_rate_limit()
def edit_specific_log(query, value):
    logs.update_one(query, value)


@retry_on_rate_limit()
def search_logs(pipeline):
    cursor = logs.aggregate(pipeline)
    return cursor


@retry_on_rate_limit()
def delete_logs(query):
    logs.delete_many(query)


@retry_on_rate_limit()
def edit_status(cik, status):
    logs.update_one({"cik": cik}, {"$set": {"status": status}})


@retry_on_rate_limit()
def find_logs(query, project={"_id": 0}):
    result = logs.find(query, project)

    return result


@retry_on_rate_limit()
def watch_logs(pipeline):
    cursor = main.watch(pipeline)
    return cursor


@retry_on_rate_limit()
def add_statistic(cik, query, statistic, completion):
    statistic = {
        "cik": cik,
        **statistic,
        "type": query,
        "completion": completion,
    }
    statistics.insert_one(statistic)


@retry_on_rate_limit()
def add_query_log(cik, query, completion=None):
    try:
        filer_done = find_filer(
            cik,
            {
                "cik": 1,
                "name": 1,
                "_id": 0,
            },
        )
        filer_log = find_log(cik, {"logs": 0})
        if filer_done and filer_log:
            stock_count = 0
            filings = find_filings(cik)
            for filing in filings:
                filing_stocks = filing.get("stocks", [])
                for _ in filing_stocks:
                    stock_count += 1

            if not completion:
                completion = filer_log["time"]["elapsed"]

            query_log = {
                **filer_done,
                "type": query,
                "log": filer_log,
                "completion": completion,
                "count": stock_count,
            }
            statistics.insert_one(query_log)
    except Exception as e:
        logging.error(e)


@retry_on_rate_limit()
def add_companies(companies_list):
    companies.insert_many(companies_list)


@retry_on_rate_limit()
def find_statistics(query, project={"_id": 0}):
    results = statistics.find(query, project)
    return results
