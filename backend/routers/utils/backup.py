import bson
from datetime import datetime

from .mongo import *
from .search import *
from .api import *


def backup_collections():
    backup_client = MongoClient(MONGO_SERVER_URL)
    collections = ["companies", "filers"]

    for coll in collections:
        with open(f"./public/backup/{coll}.bson", "wb+") as f:
            cursor = backup_client["wallstreetlocal"][coll].find({})
            for document in cursor:
                f.write(bson.BSON.encode(document))


def generate_collections():
    company_info = company_tickers()
    documents = []
    batch_limit = 200

    for _, company_filer in company_info.items():
        try:
            if len(documents) >= batch_limit:
                for d in documents:
                    companies.update_one({"cik": d["cik"]}, {"$set": d}, upsert=True)
                companies_index.add_documents(documents)
                documents = []

            cik = str(company_filer["cik_str"])

            company_sec = sec_filer_search(cik)
            sec_tickers = company_sec["tickers"]
            company_sec["tickers"] = (
                [company_filer["ticker"]] if sec_tickers == [] else sec_tickers
            )

            form_types = company_sec["filings"]["recent"]["form"]
            company_sec["thirteen_f"] = (
                True
                if True
                in [True if "thirteen_f" in form else False for form in form_types]
                else False
            )
            del company_sec["filings"]

            query = {"cik": cik}
            documents.append(company_sec)
            print(f"Successfully Inserted Company [{cik}]")

        except Exception as e:
            stamp = str(datetime.now())
            with open(f"./public/backup/error-{stamp}.log", "w+") as f:
                f.write(e)
            print("Error Occured")

    company_funds = fund_tickers()
    for fund in company_funds["data"]:
        try:
            if len(documents) >= batch_limit:
                for d in documents:
                    companies.update_one({"cik": d["cik"]}, {"$set": d}, upsert=True)
                companies_index.add_documents(documents)
                documents = []

            cik = str(fund[0])
            series_id = fund[1]
            class_id = fund[2]

            if company_sec["tickers"] != []:
                ticker = fund[3]
                company_sec["tickers"] = [ticker]
            form_types = company_sec["filings"]["recent"]["form"]
            company_sec["series_id"] = series_id
            company_sec["class_id"] = class_id
            company_sec["thirteen_f"] = (
                True
                if True
                in [True if "thirteen_f" in form else False for form in form_types]
                else False
            )
            del company_sec["filings"]

            query = {"cik": cik}
            companies.update_one(query, {"$set": company_sec}, upsert=True)
            print(f"Successfully Inserted Company [{cik}]")

        except Exception as e:
            stamp = str(datetime.now())
            with open(f"./public/backup/error-{stamp}.log", "w+") as f:
                f.write(e)
            print("Error Occured")
