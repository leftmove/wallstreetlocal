from bs4 import BeautifulSoup
from datetime import datetime
import xml.etree.ElementTree as ElementTree

import lxml
import cchardet
import json
import logging

from . import database
from . import api
from . import analysis
from . import errors


def process_names(stocks, cik):
    cusip_list = list(map(lambda s: s["cusip"], stocks))
    cursor = database.find_stocks("cusip", {"$in": cusip_list})

    global_stocks = {}
    found_stocks = {}
    skip = []

    for found_stock in cursor:
        cusip = found_stock["cusip"]
        found_stocks[cusip] = found_stock

    for stock in stocks:
        cusip = stock["cusip"]
        name = stock["name"]
        msg = "Querying Stock\n"

        found_stock = found_stocks.get(cusip)
        if found_stock:
            ticker = found_stock["ticker"]
            name = found_stock["name"]
            msg += "Success, Found Stock"
            global_stocks[cusip] = {
                "name": name,
                "ticker": ticker,
                "cusip": cusip,
                "update": found_stock["update"],
            }
            database.add_log(cik, msg, name, cusip)

        else:
            try:
                result = api.stock_request(cusip, cik, name)
                ticker = result["ticker"]
                name = result["name"]

                stock = process_stock(ticker, cusip, name, cik)

                if stock:
                    ticker = stock["ticker"]
                    name = stock["name"]
                    msg += "Success, Added Stock"
                else:
                    name = result["name"]
                    stock = {
                        "name": name,
                        "ticker": ticker,
                        "cusip": cusip,
                        "update": False,
                    }
                    msg += "Failed, No Query Data"

                database.add_stock(stock)
                database.add_log(cik, msg, name, cusip)

                global_stocks[cusip] = stock
                database.add_log(cik, msg, name, cusip)
            except Exception as e:
                if cusip in skip:
                    continue

                stock = {"name": name, "ticker": "N/A", "cusip": cusip, "update": False}

                database.add_stock(stock)
                skip.append(cusip)
                global_stocks[cusip] = stock

                msg += "Failed, No Query Data"
                database.add_log(cik, msg, name, cusip)
                errors.report_error(f"{cik}, {cusip}", e)

    return global_stocks


def check_new(cik):
    document_reports = check_forms(cik)

    latest_report = document_reports[-1]
    latest_date = latest_report["report"]

    filer = database.find_filer(cik, {"last_report": 1})
    last_report = filer["last_report"]
    recent_filing = database.find_filing(cik, last_report)
    queried_report = recent_filing["report_date"]

    if latest_date > queried_report:
        latest_access = latest_report["access"]
        return True, latest_access
    else:
        return False, None


def check_forms(cik):
    data = api.sec_filer_search(cik)
    recent_filings = data["filings"]["recent"]

    document_reports = []
    for i, form in enumerate(recent_filings["form"]):
        if form in database.holding_forms:
            report = analysis.convert_date(recent_filings["reportDate"][i])
            access = recent_filings["accessionNumber"][i]
            document_reports.append({"report": report, "access": access})
    document_reports = sorted(document_reports, key=lambda d: d["report"])

    return document_reports


def sort_rows(row_one, row_two):
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
            else:
                multiplier = 1
        elif lineTwo.text == "PRN AMT":
            shrsColumn = i
    return nameColumn, classColumn, cusipColumn, valueColumn, shrsColumn, multiplier


def process_keys(tickers, name, cik):
    if tickers == []:
        try:
            stock_info = api.stock_request(name, cik)
        except (KeyError, IndexError, LookupError) as e:
            logging.info(f"Failed to get Name Data {name}\n{e}\n")
            stock_info = {}
    else:
        for ticker in tickers:
            try:
                stock_info = api.ticker_request("OVERVIEW", ticker, cik)
                name = stock_info["Name"]
                break
            except Exception as e:
                stock_info = {}
                logging.error(e)
                errors.report_error(f"{cik}, {name}", e)
    return name, stock_info  # type: ignore


def process_filings(cik, data):
    data_filings = data["filings"]["recent"]
    filings = []
    for i, form in enumerate(data_filings["form"]):
        filing = {
            "cik": cik,
            "form": data_filings["form"][i],
            "access_number": data_filings["accessionNumber"][i],
            "filing_date": analysis.convert_date(data_filings["filingDate"][i]),
            "report_date": analysis.convert_date(data_filings["reportDate"][i]),
            "document": data_filings["primaryDocument"][i],
            "description": data_filings["primaryDocDescription"][i],
        }
        filings.append(filing)

    last_report = "N/A"
    first_report = "N/A"
    for i, form in enumerate(data_filings["form"]):
        if form in database.holding_forms:
            if last_report == "N/A":
                last_report = data_filings["accessionNumber"][i]
            first_report = data_filings["accessionNumber"][i]

    return filings, last_report, first_report


def initialize_filer(cik, sec_data):
    company = {
        "name": sec_data["name"],
        "cik": cik,
    }
    start = datetime.now().timestamp()
    stamp = {
        **company,
        "status": 4,
        "time": {
            "remaining": 0,
            "elapsed": 0,
            "required": 0,
        },
        "start": start,
    }

    database.create_log(stamp)
    database.add_filer(company)
    company, filings = process_filer(cik, sec_data)

    stamp = {"name": company["name"], "start": start}
    database.edit_log(cik, stamp)
    database.edit_filer({"cik": cik}, {"$set": company})
    database.add_filings(filings)

    return company, stamp


redundant_keys = ["name", "cik", "symbol"]


def process_filer(cik, data):
    filings, last_report, first_report = process_filings(cik, data)
    time = (datetime.now()).timestamp()

    name = data["name"]
    tickers = data["tickers"]
    name, info = process_keys(tickers, name, cik)

    extra_data = analysis.convert_underscore(info, {})
    for rk in redundant_keys:
        extra_data.pop(rk, None)

    company = {
        "name": name,
        "cik": cik,
        "tickers": tickers,
        "updated": time,
        "exchanges": data["exchanges"],
        "stocks": [],
        "first_report": first_report,
        "last_report": last_report,
        "financials": extra_data,
    }

    return company, filings


def process_stock(ticker, cusip, name, cik):
    try:
        stock_info = api.ticker_request("OVERVIEW", ticker, cik)
        stock_price = (api.ticker_request("GLOBAL_QUOTE", ticker, cik))["Global Quote"]
    except Exception as e:
        logging.error(e)
        errors.report_error(f"{cik}, {cusip}", e)
        return None

    if stock_info == {} and stock_price == {}:
        return None

    price = stock_price.get("05. price")
    for key in stock_info.keys():
        field = stock_info[key]
        if field is None:
            stock_info[key] = "N/A"
    for key in stock_price.keys():
        field = stock_price[key]
        if field is None:
            stock_price[key] = "N/A"

    financials = analysis.convert_underscore(stock_info)
    quote = {}
    for key in stock_price:
        new_key = key[4:].replace(" ", "_")
        quote[new_key] = stock_price[key]

    info = {
        "name": stock_info.get("Name", name),
        "ticker": ticker,
        "cik": stock_info.get("CIK", "N/A"),
        "cusip": cusip,
        "sector": stock_info.get("Sector", "N/A"),
        "industry": stock_info.get("Industry", "N/A"),
        "price": "N/A" if price is None else float(price),
        "time": (datetime.now()).timestamp(),
        "financials": financials,
        "quote": quote,
        "update": True,
    }

    return info


def scrape_txt(cik, filing, directory):
    pass


def scrape_html(cik, filing, directory, empty=False):
    data = api.sec_directory_search(cik, directory)
    stock_soup = BeautifulSoup(data, "lxml")
    stock_table = stock_soup.find_all("table")[3]
    stock_fields = stock_table.find_all("tr")[1:3]
    stock_rows = stock_table.find_all("tr")[3:]

    (
        nameColumn,
        classColumn,
        cusipColumn,
        valueColumn,
        shrsColumn,
        multiplier,
    ) = sort_rows(stock_fields[0], stock_fields[1])

    row_stocks = {}
    report_date = filing["report_date"]
    access_number = filing["access_number"]

    for row in stock_rows:
        columns = row.find_all("td")

        if empty:
            yield None

        stock_cusip = columns[cusipColumn].text
        stock_name = columns[nameColumn].text
        stock_value = float(columns[valueColumn].text.replace(",", "")) * multiplier
        stock_shrs_amt = float(columns[shrsColumn].text.replace(",", ""))
        stock_class = columns[classColumn].text

        row_stock = row_stocks.get(stock_cusip)

        if row_stock is None:
            new_stock = {
                "name": stock_name,
                "ticker": "N/A",
                "class": stock_class,
                "market_value": stock_value,
                "shares_held": stock_shrs_amt,
                "cusip": stock_cusip,
                "date": report_date,
                "access_number": access_number,
            }
        else:
            new_stock = row_stock
            new_stock["market_value"] = row_stock["market_value"] + stock_value
            new_stock["shares_held"] = row_stock["shares_held"] + stock_shrs_amt

        row_stocks[stock_cusip] = new_stock
        yield new_stock


def scrape_xml(cik, filing, directory, empty=False):
    data = api.sec_directory_search(cik, directory)
    data_str = data.decode(json.detect_encoding(data))
    tree = ElementTree.fromstring(data_str)

    info_table = {}
    namespace = {"ns": "http://www.sec.gov/edgar/document/thirteenf/informationtable"}

    report_date = filing["report_date"]
    access_number = filing["access_number"]

    for info in tree.findall("ns:infoTable", namespace):
        if empty:
            yield None

        stock_cusip = info.find("ns:cusip", namespace).text
        stock_name = info.find("ns:nameOfIssuer", namespace).text
        stock_value = float(info.find("ns:value", namespace).text.replace(",", ""))
        stock_shrs_amt = float(
            info.find("ns:shrsOrPrnAmt", namespace)
            .find("ns:sshPrnamt", namespace)
            .text.replace(",", "")
        )
        stock_class = info.find("ns:titleOfClass", namespace).text

        info_stock = info.get(stock_cusip)

        if info_stock is None:
            new_stock = {
                "name": stock_name,
                "ticker": "N/A",
                "class": stock_class,
                "market_value": stock_value,
                "shares_held": stock_shrs_amt,
                "cusip": stock_cusip,
                "date": report_date,
                "access_number": access_number,
            }
        else:
            new_stock = info_stock
            new_stock["market_value"] = info_stock["market_value"] + stock_value
            new_stock["shares_held"] = info_stock["shares_held"] + stock_shrs_amt

        info_table[stock_cusip] = new_stock
        yield new_stock


info_table_key = ["INFORMATION TABLE", "Complete submission text file"]


def scrape_stocks(cik, data, filing, last_report, empty=False):
    index_soup = BeautifulSoup(data, "lxml")
    rows = index_soup.find_all("tr")
    directory = {"link": None, "type": None}
    for row in rows:
        items = list(map(lambda b: b.text.strip(), row))
        if any(item in items for item in info_table_key):
            link = row.find("a")
            href = link["href"]

            is_xml = True if href.endswith(".xml") else False
            is_html = True if "xslForm" in href else False
            is_txt = False

            directory_type = directory["type"]
            if is_html:
                directory["type"] = "html"
                directory["link"] = href
            elif is_xml and directory_type != "html":
                directory["type"] = "xml"
                directory["link"] = href
            # elif is_txt and directory_type != "xml" and directory_type != "html":
            #     directory["type"] = "txt"
            #     directory["link"] = href

    link = directory["link"]
    form = directory["type"]
    if not link:
        filing_stocks = {}
        return filing_stocks

    if form == "html":
        scrape_document = scrape_html
    elif form == "xml":
        scrape_document = scrape_xml
    # elif form == "txt":
    #     scrape_document = scrape_txt

    if empty:
        for i, _ in enumerate(scrape_document(cik, filing, link, empty)):
            row_count = i
        return row_count

    access_number = filing["access_number"]
    update_list = [
        {**new_stock, "sold": True if access_number == last_report else False}
        for new_stock in scrape_document(cik, filing, link)
    ]
    updated_stocks = process_names(update_list, cik)

    filing_stocks = {}
    for new_stock in update_list:
        stock_cusip = new_stock["cusip"]
        updated_stock = updated_stocks[stock_cusip]

        updated_stock.pop("_id", None)
        new_stock.update(updated_stock)

        filing_stocks[stock_cusip] = new_stock

    return filing_stocks


def process_stocks(cik, filings):
    filings_list = sorted(
        [f for f in filter(None, filings)], key=lambda d: d.get("report_date", 0)
    )
    last_report = filings_list[-1]["access_number"]
    for document in filings_list:
        access_number = document["access_number"]
        form_type = document["form"]

        if form_type not in database.holding_forms:
            continue

        data = api.sec_stock_search(cik=cik, access_number=access_number)
        try:
            new_stocks = scrape_stocks(
                cik=cik, data=data, filing=document, last_report=last_report
            )
            yield access_number, new_stocks
        except Exception as e:
            logging.info(f"\nError Updating Stocks\n{e}\n--------------------------\n")
            errors.report_error(f"{cik}, {access_number}", e)
            continue


def query_stocks(found_stocks):
    for found_stock in found_stocks:
        if found_stock is None:
            continue

        ticker = found_stock.get("ticker")
        time = datetime.now().timestamp()
        last_updated = found_stock.get("updated")

        if last_updated is not None:
            if (time - last_updated) < (60 * 60 * 24 * 3):
                continue

        try:
            price_info = api.ticker_request("GLOBAL_QUOTE", ticker, "")
            global_quote = price_info["Global Quote"]
            price = global_quote["05. price"]
        except Exception as e:
            logging.error(e)
            errors.report_error(f"{ticker}", e)
            continue

        database.edit_stock(
            {"ticker": ticker},
            {"$set": {"updated": time, "recent_price": price, "quote": global_quote}},
        )


def estimate_time_newest(cik):
    filer = database.find_filer(cik, {"last_report": 1})
    if not filer:
        raise LookupError

    last_report = filer["last_report"]
    last_filing = database.find_filing(cik, last_report)
    if not last_filing:
        raise LookupError

    try:
        data = api.sec_stock_search(cik=cik, access_number=last_report)
        stock_count = scrape_stocks(cik=cik, data=data, filing=last_filing, empty=True)
    except Exception as e:
        logging.info(f"Error Counting Stocks\n{e}")
        errors.report_error(f"{cik}, {last_report}", e)
        raise

    log = database.find_log(cik, {"status": 1})
    status = log["status"] if log else 4

    remaining = analysis.time_remaining(stock_count)
    database.edit_log(
        cik, {"status": 3 if status > 3 else status, "time.required": remaining}
    )
