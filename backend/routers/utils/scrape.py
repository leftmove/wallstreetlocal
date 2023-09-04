from .analysis import *
from .mongo import *
from .api import *


from bs4 import BeautifulSoup
from time import sleep
from dotenv import load_dotenv
from datetime import datetime
import re

load_dotenv()


print("[ Data Initializing ] ...")

capital_pattern = re.compile(r"(.)([A-Z][a-z]+)")
underscore_pattern = re.compile(r"([a-z0-9])([A-Z])")


async def scrape_name(cusip, name, cik):
    msg = f"Querying Stock [ {name} ({cusip}) ]\n"
    found_stock = await find_stock("cusip", cusip)
    if found_stock == None:
        try:
            data = await cusip_request(cusip, cik)
            data = data["result"][0]
            name = data["name"]
            ticker = data["symbol"]

            stock = await scrape_stock(ticker, cusip, cik)
            stock["update"] = True

            await add_stock(stock)
            msg += f"Success, Added Stock {name} ({cusip})"

            await add_log(cik, msg)
            return ticker, name
        except (KeyError, IndexError) as e:
            stock = {"name": name, "ticker": "NA", "cusip": cusip}
            stock["update"] = False
            await add_stock(stock)
            msg += f"Failed {name} ({cusip}), No Query Data"

            await add_log(cik, msg)
            return "NA", name
        except Exception as e:
            stock = {"name": name, "ticker": "NA", "cusip": cusip}
            stock["update"] = False

            await add_stock(stock)
            msg += f"Failed {name} ({cusip}), Unknown Error"

            await add_log(cik, msg)
            return "NA", name
    else:
        name = found_stock["name"]
        msg += f"Success, Found Stock {name} ({cusip})"

        await add_log(cik, msg)
        return found_stock["ticker"], found_stock["name"]


async def scrape_names(stocks, cik):
    global_stocks = {}
    found_stocks = {}
    skip = []
    cusip_list = list(map(lambda s: s["cusip"], stocks))
    cursor = await find_stocks("cusip", {"$in": cusip_list})
    async for found_stock in cursor:
        cusip = found_stock["cusip"]
        found_stocks[cusip] = found_stock

    for stock in stocks:
        cusip = stock["cusip"]
        name = stock["name"]
        msg = f"Querying Stock [ {name} ({cusip}) ]\n"

        found_stock = found_stocks.get(cusip)
        if found_stock:
            ticker = found_stock["ticker"]
            name = found_stock["name"]
            msg += f"Success, Found Stock {name} ({cusip})"
            global_stocks[cusip] = {
                "name": name,
                "ticker": ticker,
                "cusip": cusip,
                "update": True,
            }
            await add_log(cik, msg)

        else:
            try:
                data = await cusip_request(cusip, cik)
                data = data["result"][0]
                ticker = data["symbol"]

                stock = await scrape_stock(ticker, cusip, cik)
                name = stock["name"]
                await add_stock(stock)

                global_stocks[cusip] = {
                    "name": name,
                    "ticker": ticker,
                    "cusip": cusip,
                    "update": True,
                }
                msg += f"Success, Added Stock {name} ({cusip})"
                await add_log(cik, msg)

            except (KeyError, IndexError) as e:
                if cusip in skip:
                    continue

                stock = {"name": name, "ticker": "NA", "cusip": cusip, "update": False}
                await add_stock(stock)
                skip.append(cusip)
                global_stocks[cusip] = stock

                msg += f"Failed {name} ({cusip}), No Query Data"
                await add_log(cik, msg)

            except Exception as e:
                if cusip in skip:
                    continue

                stock = {"name": name, "ticker": "NA", "cusip": cusip, "update": False}

                await add_stock(stock)
                skip.append(cusip)
                global_stocks[cusip] = stock

                msg += f"Failed {name} ({cusip}), Unknown Error"
                await add_log(cik, msg)

    return global_stocks


async def scrape_filings(data):
    data_filings = data["filings"]["recent"]
    filings = {}
    for i, form in enumerate(data_filings["form"]):
        if form != "13F-HR":
            continue

        access_number = data_filings["accessionNumber"][i]
        filing = {
            # "form": data_filings["form"][i],
            "access_number": data_filings["accessionNumber"][i],
            "filing_date": await convert_date(data_filings["filingDate"][i]),
            "report_date": await convert_date(data_filings["reportDate"][i]),
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


info_table_key = ["INFORMATION TABLE", "INFORMATION TABLE FOR FORM 13F"]


async def check_new(cik, last_updated):
    data = await sec_filer_search(cik)
    new_date = await convert_date(data["filings"]["recent"]["filingDate"][-1])

    if new_date > last_updated:
        return True
    else:
        return False


async def sort_rows(row_one, row_two):
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


async def scrape_keys(tickers, name, cik):
    if tickers == []:
        try:
            data = await cusip_request(name, cik)
            stock_info = data["result"][0]
        except (KeyError, IndexError) as e:
            print(f"Failed, Key Error {name}\n{e}\n")
            stock_info = {}
    else:
        for ticker in tickers:
            try:
                stock_info = await ticker_request("OVERVIEW", ticker, cik)
                name = stock_info["Name"]
                break
            except Exception as e:
                stock_info = {}
                print(e)
    return name, stock_info  # type: ignore


async def scrape_filer(data, cik):
    filings, last_report, first_report = await scrape_filings(data)
    time = (datetime.now()).timestamp()

    name = data["name"]
    tickers = data["tickers"]
    name, info = await scrape_keys(tickers, name, cik)

    extra_data = {}
    for key in info:
        new_key = capital_pattern.sub(r"\1_\2", key)
        new_key = underscore_pattern.sub(r"\1_\2", new_key).lower()
        extra_data[new_key] = info[key]

    company = {
        "name": name,
        "tickers": tickers,
        "updated": time,
        "exchanges": data["exchanges"],
        "stocks": {},
        "filings": filings,
        "first_report": first_report,
        "last_report": last_report,
        "data": extra_data,
    }

    return company


async def scrape_filer_newest(company):
    cik = company["cik"]
    newest_data = await sec_filer_search(cik)
    filings, last_report = await scrape_filings(newest_data)  # type: ignore

    return filings, last_report


async def scrape_stock(ticker, cusip, cik):
    try:
        stock_info = await ticker_request("OVERVIEW", ticker, cik)
        stock_price = (await ticker_request("GLOBAL_QUOTE", ticker, cik))[
            "Global Quote"
        ]
    except Exception as e:
        print(e)
        raise ConnectionError

    for key, key2 in zip(stock_info.keys(), stock_price.keys()):
        try:
            field = stock_info[key]
            field2 = stock_price[key2]
            if field == None or field2 == None:
                raise KeyError
        except Exception as e:
            print(e)
            stock_info[key] = "NA"
    price = stock_price.get("05. price")

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
        "name": stock_info.get("Name"),
        "ticker": ticker,
        "cik": stock_info.get("CIK"),
        "cusip": cusip,
        "sector": stock_info.get("Sector"),
        "industry": stock_info.get("Industry"),
        "price": "NA" if price == None else float(price),
        "time": (datetime.now()).timestamp(),
        "data": data,
        "quote": quote,
        "update": True,
    }

    return info


async def scrape_stocks(
    data, last_report, access_number, report_date, global_stocks, cik
):
    index_soup = BeautifulSoup(data, "html.parser")
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

    data = await sec_directory_search(directory)
    stock_soup = BeautifulSoup(data, "html.parser")
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
    ) = await sort_rows(stock_fields[0], stock_fields[1])

    local_stocks = {}
    stock_count = 0
    for row in stock_rows:
        Columnumns = row.find_all("td")

        stock_name = Columnumns[nameColumn].text
        stock_value = float(Columnumns[valueColumn].text.replace(",", "")) * multiplier
        stock_shrs_amt = float(Columnumns[shrsColumn].text.replace(",", ""))
        stock_class = Columnumns[classColumn].text
        stock_cusip = Columnumns[cusipColumn].text

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
        stock_count += 1

    await aggregate_filers(
        [
            {"$match": {"cik": cik}},
            {
                "$set": {
                    "log.time.required": {"$add": ["$log.time.required", stock_count]},
                    "log.time.elapsed": {
                        "$add": [datetime.now().timestamp(), "$log.start"]
                    },
                    "log.time.remaining": {
                        "$subtract": ["$log.time.required", "$log.time.elapsed"]
                    },
                }
            },
        ]
    )

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

    updated_stocks = await scrape_names(update_list, cik)
    for new_stock in update_list:
        stock_cusip = new_stock["cusip"]
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
    #         ticker, name = await scrape_name(stock_cusip, stock_name)
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


async def scrape_new_stocks(company):
    cik = company["cik"]
    filings = company["filings"]
    last_report = company["last_report"]

    global_stocks = {}
    for access_number in filings:
        document = filings[access_number]
        document_report_date = document["report_date"]

        data = await sec_stock_search(cik=cik, access_number=access_number)
        try:
            new_stocks = await scrape_stocks(
                data=data,
                last_report=last_report,
                access_number=access_number,
                report_date=document_report_date,
                global_stocks=global_stocks,
                cik=cik,
            )
            global_stocks.update(new_stocks)
        except Exception as e:
            print(f"\nError Updating Stocks\n{e}\n--------------------------\n")
            continue

    return global_stocks


async def scrape_latest_stocks(company):
    cik = company["cik"]
    filings = company["filings"]
    last_report = company["last_report"]
    previous_stocks = company["stocks"]

    document = filings[last_report]
    access_number = document["access_number"]
    document_report_date = document["report_date"]

    data = await sec_stock_search(cik=cik, access_number=access_number)
    try:
        new_stocks = await scrape_stocks(
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


print("[ Data Initialized ]")
