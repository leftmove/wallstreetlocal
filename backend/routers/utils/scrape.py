from bs4 import BeautifulSoup
from datetime import datetime
import lxml
import cchardet

from .mongo import find_filer
from .mongo import edit_filer
from .mongo import find_stocks
from .mongo import add_stock
from .mongo import edit_stock
from .mongo import find_log
from .mongo import add_log
from .mongo import edit_log

from .api import ticker_request
from .api import stock_request
from .api import sec_filer_search
from .api import sec_stock_search
from .api import sec_directory_search

from .analysis import convert_date
from .analysis import convert_underscore
from .analysis import capital_pattern
from .analysis import underscore_pattern
from .analysis import time_remaining

# type: reportGeneralTypeIssues=false

print("[ Data Initializing ] ...")

parser = "lxml"


# def scrape_name(cusip, name, cik):
#     msg = f"Querying Stock\n"
#     found_stock = find_stock("cusip", cusip)

#     if found_stock == None:
#         try:
#             data = cusip_request(cusip, cik)
#             result = data["result"][0]
#             ticker = data["symbol"]

#             stock = scrape_stock(ticker, cusip, cik)

#             if stock:
#                 ticker = stock["ticker"]
#                 name = stock["name"]
#                 msg += f"Success, Added Stock"
#             else:
#                 name = result["description"]
#                 stock = {
#                     "name": name,
#                     "ticker": ticker,
#                     "cusip": cusip,
#                     "update": False,
#                 }
#                 msg += f"Failed, No Query Data"

#             add_stock(stock)
#             add_log(cik, msg, name, cusip)

#             return ticker, name
#         except Exception:
#             stock = {"name": name, "ticker": "NA", "cusip": cusip}
#             stock["update"] = False

#             add_stock(stock)
#             msg += f"Failed, Unknown Error"

#             add_log(cik, msg, name, cusip)
#             return "NA", name
#     else:
#         name = found_stock["name"]
#         msg += f"Success, Found Stock"

#         add_log(cik, msg, name, cusip)
#         return found_stock["ticker"], found_stock["name"]


def scrape_names(stocks, cik):
    global_stocks = {}
    found_stocks = {}
    skip = []
    cusip_list = list(map(lambda s: s["cusip"], stocks))
    cursor = find_stocks("cusip", {"$in": cusip_list})

    for found_stock in cursor:
        cusip = found_stock["cusip"]
        found_stocks[cusip] = found_stock

    for stock in stocks:
        cusip = stock["cusip"]
        name = stock["name"]
        msg = f"Querying Stock\n"

        found_stock = found_stocks.get(cusip)
        if found_stock:
            ticker = found_stock["ticker"]
            name = found_stock["name"]
            msg += f"Success, Found Stock"
            global_stocks[cusip] = {
                "name": name,
                "ticker": ticker,
                "cusip": cusip,
                "update": found_stock["update"],
            }
            add_log(cik, msg, name, cusip)

        else:
            try:
                result = stock_request(cusip, cik, name)
                ticker = result["ticker"]
                name = result["name"]

                stock = scrape_stock(ticker, cusip, name, cik)

                if stock:
                    ticker = stock["ticker"]
                    name = stock["name"]
                    msg += f"Success, Added Stock"
                else:
                    name = result["name"]
                    stock = {
                        "name": name,
                        "ticker": ticker,
                        "cusip": cusip,
                        "update": False,
                    }
                    msg += f"Failed, No Query Data"

                add_stock(stock)
                add_log(cik, msg, name, cusip)

                global_stocks[cusip] = stock
                add_log(cik, msg, name, cusip)
            except Exception:
                if cusip in skip:
                    continue

                stock = {"name": name, "ticker": "NA", "cusip": cusip, "update": False}

                add_stock(stock)
                skip.append(cusip)
                global_stocks[cusip] = stock

                msg += f"Failed, No Query Data"
                add_log(cik, msg, name, cusip)

    return global_stocks


def scrape_filings(data):
    data_filings = data["filings"]["recent"]
    filings = {}
    for i, form in enumerate(data_filings["form"]):
        if form != "13F-HR":
            continue

        access_number = data_filings["accessionNumber"][i]
        filing = {
            # "form": data_filings["form"][i],
            "access_number": data_filings["accessionNumber"][i],
            "filing_date": convert_date(data_filings["filingDate"][i]),
            "report_date": convert_date(data_filings["reportDate"][i]),
            "document": data_filings["primaryDocument"][i],
            "description": data_filings["primaryDocDescription"][i],
        }
        filings[access_number] = filing

    last_report = "NA"
    first_report = "NA"
    for i, form in enumerate(data_filings["form"]):
        if form == "13F-HR":
            if last_report == "NA":
                last_report = data_filings["accessionNumber"][i]

            first_report = data_filings["accessionNumber"][i]

    return filings, last_report, first_report


info_table_key = ["INFORMATION TABLE"]


def check_new(cik, last_updated):
    data = sec_filer_search(cik)
    new_date = convert_date(data["filings"]["recent"]["filingDate"][-1])

    if new_date > last_updated:
        return True
    else:
        return False


def sort_rows(row_one, row_two):
    nameColumn = 0
    classColumn = 1
    cusipColumn = 2
    valueColumn = 5
    shrsColumn = 6
    multiplier = 1
    for i, (lineOne, lineTwo) in enumerate(
        zip(row_one.find_all("td"), row_two.find_all("td"))
    ):
        if lineTwo.text == "NAME OF ISSUER":
            nameColumn = i
        elif lineTwo.text == "TITLE OF CLASS":
            classColumn = i
        elif lineTwo.text == "CUSIP":
            cusipColumn = i
        elif lineOne.text == "VALUE":
            valueColumn = i
            if lineTwo.text == "(x$1000)":
                multiplier = 1000
        elif lineTwo.text == "PRN AMT":
            shrsColumn = i
    return nameColumn, classColumn, cusipColumn, valueColumn, shrsColumn, multiplier


def scrape_keys(tickers, name, cik):
    if tickers == []:
        try:
            data = stock_request(name, cik)
            stock_info = data["result"][0]
        except (KeyError, IndexError) as e:
            print(f"Failed to get Name Data {name}\n{e}\n")
            stock_info = {}
    else:
        for ticker in tickers:
            try:
                stock_info = ticker_request("OVERVIEW", ticker, cik)
                name = stock_info["Name"]
                break
            except Exception as e:
                stock_info = {}
                print(e)
    return name, stock_info  # type: ignore


def scrape_filer(data, cik):
    filings, last_report, first_report = scrape_filings(data)
    time = (datetime.now()).timestamp()

    name = data["name"]
    tickers = data["tickers"]
    name, info = scrape_keys(tickers, name, cik)

    company = {
        "name": name,
        "cik": cik,
        "tickers": tickers,
        "updated": time,
        "exchanges": data["exchanges"],
        "filings": filings,
        "first_report": first_report,
        "last_report": last_report,
    }

    extra_data = convert_underscore(info, company)
    company["data"] = extra_data

    return company


def scrape_filer_newest(company):
    cik = company["cik"]
    newest_data = sec_filer_search(cik)
    filings, last_report = scrape_filings(newest_data)  # type: ignore

    return filings, last_report


def scrape_stock(ticker, cusip, name, cik):
    try:
        stock_info = ticker_request("OVERVIEW", ticker, cik)
        stock_price = (ticker_request("GLOBAL_QUOTE", ticker, cik))["Global Quote"]
    except Exception as e:
        print(e)
        return None

    if stock_info == {} and stock_price == {}:
        return None

    price = stock_price.get("05. price")
    for key in stock_info.keys():
        field = stock_info[key]
        if field == None:
            stock_info[key] = "NA"
    for key in stock_price.keys():
        field = stock_price[key]
        if field == None:
            stock_price[key] = "NA"

    data = {}
    for key in stock_info:
        new_key = capital_pattern.sub(r"\1_\2", key)
        new_key = underscore_pattern.sub(r"\1_\2", new_key).lower()
        data[new_key] = stock_info[key]

    quote = {}
    for key in stock_price:
        new_key = key[4:].replace(" ", "_")
        quote[new_key] = stock_price[key]

    info = {
        "name": stock_info.get("Name", name),
        "ticker": ticker,
        "cik": stock_info.get("CIK", "NA"),
        "cusip": cusip,
        "sector": stock_info.get("Sector", "NA"),
        "industry": stock_info.get("Industry", "NA"),
        "price": "NA" if price == None else float(price),
        "time": (datetime.now()).timestamp(),
        "data": data,
        "quote": quote,
        "update": True,
    }

    return info


def scrape_count_stocks(data, cik):
    index_soup = BeautifulSoup(data, parser)
    rows = index_soup.find_all("tr")
    directory = None
    for row in rows:
        # The most genius code ever written
        info_row = any(
            [
                True
                if any(
                    [
                        True if d in table_key and d and d != " " else False
                        for d in [b.text.strip() for b in row]
                    ]
                )
                else False
                for table_key in info_table_key
            ]
        )
        if info_row:
            link = row.find("a")
            directory = link["href"]
            break
    if directory == None:
        return 0

    data = sec_directory_search(directory, cik)
    stock_soup = BeautifulSoup(data, parser)
    stock_table = stock_soup.find_all("table")[3]
    stock_fields = stock_table.find_all("tr")[1:3]
    stock_rows = stock_table.find_all("tr")[3:]

    (
        _,
        _,
        cusipColumn,
        _,
        _,
        _,
    ) = sort_rows(stock_fields[0], stock_fields[1])

    stock_count = 0
    local_stocks = []
    for row in stock_rows:
        columns = row.find_all("td")
        stock_cusip = columns[cusipColumn].text

        if stock_cusip in local_stocks:
            continue
        else:
            local_stocks.append(stock_cusip)
            stock_count += 1

    return stock_count


def scrape_stocks(data, last_report, access_number, report_date, global_stocks, cik):
    index_soup = BeautifulSoup(data, parser)
    rows = index_soup.find_all("tr")
    directory = None
    for row in rows:
        items = list(map(lambda b: b.text.strip(), row))
        if any(item in items for item in info_table_key):
            link = row.find("a")
            directory = link["href"]
            break
    if directory == None:
        return {}

    data = sec_directory_search(directory, cik)
    stock_soup = BeautifulSoup(data, parser)
    stock_table = stock_soup.find_all("table")[3]
    stock_fields = stock_table.find_all("tr")[1:3]
    stock_rows = stock_table.find_all("tr")[3:]

    # Stock Logging
    (
        nameColumn,
        classColumn,
        cusipColumn,
        valueColumn,
        shrsColumn,
        multiplier,
    ) = sort_rows(stock_fields[0], stock_fields[1])

    local_stocks = {}
    # stock_count = 0
    for row in stock_rows:
        columns = row.find_all("td")

        stock_name = columns[nameColumn].text
        stock_value = float(columns[valueColumn].text.replace(",", "")) * multiplier
        stock_shrs_amt = float(columns[shrsColumn].text.replace(",", ""))
        stock_class = columns[classColumn].text
        stock_cusip = columns[cusipColumn].text

        local_stock = local_stocks.get(stock_cusip)

        if local_stock == None:
            new_stock = {
                "name": stock_name,
                "ticker": "NA",
                "class": stock_class,
                "market_value": stock_value,
                "shares_held": stock_shrs_amt,
                "cusip": stock_cusip,
                "date": report_date,
                "access_number": access_number,
            }
        else:
            new_stock = local_stock
            new_stock["market_value"] = local_stock["market_value"] + stock_value

        local_stocks[stock_cusip] = new_stock
        # stock_count += 1

    # aggregate_filers(
    #     [
    #         {"$match": {"cik": cik}},
    #         {
    #             "$set": {
    #                 "log.time.required": {"$add": ["$log.time.required", stock_count]},
    #                 "log.time.elapsed": {
    #                     "$add": [datetime.now().timestamp(), "$log.start"]
    #                 },
    #                 "log.time.remaining": {
    #                     "$subtract": ["$log.time.required", "$log.time.elapsed"]
    #                 },
    #             }
    #         },
    #     ]
    # )

    update_list = []
    for key in local_stocks:
        local_stock = local_stocks[key]
        global_stock = global_stocks.get(key)
        stock_cusip = local_stock["cusip"]
        stock_name = local_stock["name"]

        if global_stock == None and global_stock not in update_list:
            new_stock = local_stock
            update_list.append(new_stock)
            continue

        else:
            local_date = local_stock["date"]
            local_access_number = local_stock["access_number"]
            global_date = global_stock["date"]

            if local_date >= global_date:
                new_stock = global_stock
                new_stock["date"] = local_date
                new_stock["last_report"] = local_access_number

            else:
                new_stock = global_stock
                new_stock["first_report"] = local_access_number

            global_stocks[stock_cusip] = new_stock

    updated_stocks = scrape_names(update_list, cik)
    for new_stock in update_list:
        stock_cusip = new_stock["cusip"]

        updated_stock = updated_stocks[stock_cusip]
        updated_stock.pop("_id", None)
        new_stock.update(updated_stocks[stock_cusip])

        access_number = new_stock["access_number"]
        sold = False if access_number == last_report else True

        new_stock["sold"] = sold
        new_stock["first_report"] = access_number
        new_stock["last_report"] = access_number
        del new_stock["access_number"]

        global_stocks[stock_cusip] = new_stock

    # Legacy Implementation
    # for key in local_stocks:
    #     local_stock = local_stocks[key]
    #     global_stock = global_stocks.get(key)
    #     stock_cusip = local_stock['cusip']
    #     stock_name = local_stock['name']

    #     if global_stock == None:
    #         new_stock = local_stock
    #         access_number = local_stock['access_number']
    #         ticker, name = scrape_name(stock_cusip, stock_name)
    #         sold = False if access_number == last_report else True

    #         del new_stock['access_number']
    #         new_stock["name"] = name
    #         new_stock["ticker"] = ticker
    #         new_stock['sold'] = sold
    #         new_stock['first_report'] = access_number
    #         new_stock['last_report'] = access_number
    #     else:
    #         local_date = local_stock['date']
    #         local_access_number = local_stock['access_number']
    #         global_date = global_stock['date']

    #         if local_date > global_date:

    #             new_stock = global_stock
    #             new_stock['date'] = local_date
    #             new_stock['sold'] = sold
    #             new_stock['last_report'] = local_access_number

    #         elif local_date < global_date:
    #             new_stock = global_stock
    #             new_stock['first_report'] = local_access_number

    #     global_stocks[stock_cusip] = new_stock

    return global_stocks


def scrape_new_stocks(company):
    cik = company["cik"]
    filings = company["filings"]
    last_report = company["last_report"]

    global_stocks = {}
    for access_number in filings:
        document = filings[access_number]
        document_report_date = document["report_date"]

        data = sec_stock_search(cik=cik, access_number=access_number)
        try:
            new_stocks = scrape_stocks(
                data=data,
                last_report=last_report,
                access_number=access_number,
                report_date=document_report_date,
                global_stocks=global_stocks,
                cik=cik,
            )
            global_stocks.update(new_stocks)
            edit_filer({"cik": cik}, {"$set": {"stocks.local": global_stocks}})
        except Exception as e:
            print(f"\nError Updating Stocks\n{e}\n--------------------------\n")
            continue

    return global_stocks


def scrape_latest_stocks(company):
    cik = company["cik"]
    filings = company["filings"]
    last_report = company["last_report"]
    previous_stocks = company["stocks"]["local"] if company.get("stocks") else {}

    document = filings[last_report]
    access_number = document["access_number"]
    document_report_date = document["report_date"]

    data = sec_stock_search(cik=cik, access_number=access_number)
    try:
        new_stocks = scrape_stocks(
            data=data,
            last_report=last_report,
            access_number=access_number,
            report_date=document_report_date,
            global_stocks=previous_stocks,
            cik=cik,
        )
    except Exception as e:
        print(f"\nError Updating Stocks\n{e}\n--------------------------")
        return previous_stocks

    scraped_stocks = previous_stocks
    scraped_stocks.update(new_stocks)

    return scraped_stocks


def query_stocks(found_stocks):
    for found_stock in found_stocks:
        if found_stock == None:
            continue

        ticker = found_stock.get("ticker")
        time = datetime.now().timestamp()
        last_updated = found_stock.get("updated")

        if last_updated != None:
            if (time - last_updated) < 172800:
                continue

        try:
            price_info = ticker_request("GLOBAL_QUOTE", ticker, "")
            global_quote = price_info["Global Quote"]
            price = global_quote["05. price"]
        except Exception as e:
            print(e)
            continue

        edit_stock(
            {"ticker": ticker},
            {"$set": {"updated": time, "recent_price": price, "quote": global_quote}},
        )


def estimate_time(filings, cik):
    stock_count = 0
    for access_number in filings:
        try:
            data = sec_stock_search(cik=cik, access_number=access_number)
            new_count = scrape_count_stocks(data, cik)
            stock_count += new_count  # type: ignore
        except Exception as e:
            print(f"\nError Counting Stocks\n{e}\n--------------------------\n")
            continue

    remaining = time_remaining(stock_count)

    return remaining


def estimate_time_newest(cik):
    filer = find_filer(cik, {"last_report": 1})
    if filer == None:
        return
    last_report = filer["last_report"]
    try:
        data = sec_stock_search(cik=cik, access_number=last_report)
        stock_count = scrape_count_stocks(data, cik)
    except Exception as e:
        print(f"\nError Counting Stocks\n{e}\n--------------------------\n")
        raise

    log = find_log(cik, {"status": 1})
    status = log["status"] if log else 4

    remaining = time_remaining(stock_count)
    edit_log(cik, {"status": 3 if status > 3 else status, "time.required": remaining})

    return remaining


print("[ Data Initialized ]")
