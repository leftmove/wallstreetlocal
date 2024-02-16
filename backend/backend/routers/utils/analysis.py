from datetime import datetime
import csv
import json
import re

# import xlsxwriter

from . import database
from . import api

# pyright: reportGeneralTypeIssues=false
# pyright: reportOptionalSubscript=false


print("[ Analysis Initializing ] ...")


def convert_date(date_str):
    date = (datetime.strptime(date_str, "%Y-%m-%d")).timestamp()
    return date


quarters = [
    "Q1",
    "Q1",
    "Q1",
    "Q2",
    "Q2",
    "Q2",
    "Q3",
    "Q3",
    "Q3",
    "Q4",
    "Q4",
    "Q4",
]


def time_format(seconds: int) -> str:
    if seconds is not None:
        seconds = int(seconds)
        d = seconds // (3600 * 24)
        h = seconds // 3600 % 24
        m = seconds % 3600 // 60
        s = seconds % 3600 % 60
        if d > 0:
            return "{:02d}D {:02d}H {:02d}m {:02d}s".format(d, h, m, s)
        elif h > 0:
            return "{:02d}H {:02d}m {:02d}s".format(h, m, s)
        elif m > 0:
            return "{:02d}m {:02d}s".format(m, s)
        elif s > 0:
            return "{:02d}s".format(s)
    return "-"


def serialize_stock(local_stock, global_stock):
    cusip = local_stock["cusip"]
    update = global_stock["update"]
    ticker = global_stock["ticker"] if update else "NA"
    rights = local_stock["class"]
    sold = local_stock["sold"]
    sector = global_stock["sector"] if update else "NA"
    industry = global_stock["industry"] if update else "NA"

    timeseries = True if global_stock.get("timeseries") else False
    prices = local_stock.get("prices")
    buy_timeseries = prices.get("buy")
    sold_timeseries = prices.get("sold")
    price_recent = global_stock["price"] if update else "NA"
    price_bought = buy_timeseries["close"] if buy_timeseries != "NA" else "NA"
    price_recent_str = f"${price_recent}" if update else "NA"
    price_bought_str = f"${price_bought}" if buy_timeseries != "NA" else "NA"

    buy_float = buy_timeseries["time"] if buy_timeseries != "NA" else "NA"
    buy_date = datetime.fromtimestamp(buy_float) if buy_timeseries != "NA" else "NA"
    buy_date_str = (
        f"Q{(buy_date.month-1)//3+1} {buy_date.year}"
        if buy_timeseries != "NA"
        else "NA"
    )

    report_float = local_stock["date"] if timeseries else "NA"
    report_date = datetime.fromtimestamp(local_stock["date"]) if timeseries else "NA"
    report_date_str = (
        f"Q{(report_date.month-1)//3+1} {report_date.year}" if timeseries else "NA"
    )

    sold_float = sold_timeseries["time"] if sold and sold_timeseries != "NA" else "NA"
    sold_date = (
        datetime.fromtimestamp(sold_float) if sold and sold_timeseries != "NA" else "NA"
    )
    sold_date_str = (
        f"Q{(sold_date.month-1)//3+1} {sold_date.year}"
        if sold and sold_timeseries != "NA"
        else "NA"
    )

    name = local_stock["name"]
    ticker_str = f"{ticker} (Sold)" if sold and update else ticker

    shares_held = local_stock["shares_held"]
    market_value = local_stock["market_value"]
    portfolio_percentage = local_stock.get("portfolio")
    portfolio_percentage = (
        portfolio_percentage * 100
        if portfolio_percentage and portfolio_percentage != "NA"
        else "NA"
    )
    ownership_percentage = local_stock.get("ownership")
    ownership_percentage = (
        ownership_percentage * 100
        if ownership_percentage and ownership_percentage != "NA"
        else "NA"
    )
    gain_value = (
        float(price_recent - price_bought)
        if update and buy_timeseries != "NA"
        else "NA"
    )
    gain_percent = (
        float((gain_value / price_bought) * 100)
        if update and buy_timeseries != "NA"
        else "NA"
    )
    shares_held_str = f"{int(shares_held):,}"
    market_value_str = f"${int(market_value):,}"
    portfolio_percentage_str = (
        "{:.2f}".format(round(portfolio_percentage, 2))
        if portfolio_percentage != "NA"
        else "NA"
    )
    ownership_percentage_str = (
        "{:.2f}".format(round(ownership_percentage, 2))
        if ownership_percentage != "NA"
        else "NA"
    )
    gain_value_str = (
        "{:.2f}".format(round(gain_value, 2))
        if update and buy_timeseries != "NA"
        else "NA"
    )
    gain_percent_str = (
        "{:.2f}".format(round(gain_percent, 2))
        if update and buy_timeseries != "NA"
        else "NA"
    )

    return {
        "name": name,
        "cusip": cusip,
        "ticker": ticker,
        "ticker_str": ticker_str,
        "sector": sector,
        "industry": industry,
        "class": rights,
        "update": update,
        "sold": sold,
        "recent_price": price_recent,
        "recent_price_str": price_recent_str,
        "buy_price": price_bought,
        "buy_price_str": price_bought_str,
        "shares_held": shares_held,
        "shares_held_str": shares_held_str,
        "market_value": market_value,
        "market_value_str": market_value_str,
        "portfolio_percent": portfolio_percentage,
        "portfolio_str": portfolio_percentage_str,
        "ownership_percent": ownership_percentage,
        "ownership_str": ownership_percentage_str,
        "gain_value": gain_value,
        "gain_value_str": gain_value_str,
        "gain_percent": gain_percent,
        "gain_str": gain_percent_str,
        "buy": buy_float,
        "buy_str": buy_date_str,
        "report": report_float,
        "report_str": report_date_str,
        "sold_time": sold_float,
        "sold_str": sold_date_str,
    }


def analyze_total(cik, stocks):
    market_values = []
    for key in stocks:
        stock = stocks[key]
        if stock["sold"] == False:
            market_values.append(stock["market_value"])

    total = sum(market_values)
    database.edit_filer(
        {"cik": cik},
        {
            "$set": {
                "market_value": total,
            }
        },
    )

    return sum(total)


def analyze_value(local_stock, global_stock, total):
    market_value = local_stock["market_value"]
    percent_portfolio = market_value / total

    global_data = global_stock.get("data")
    if global_data:
        shares_outstanding = global_data.get("shares_outstanding")
        shares_held = local_stock.get("shares_held")
        percent_ownership = (
            shares_held / shares_outstanding
            if shares_held and shares_outstanding
            else "NA"
        )
    else:
        percent_ownership = "NA"

    return percent_portfolio, percent_ownership


def analyze_report(local_stock, filings):
    first_report = local_stock["first_report"]
    last_report = local_stock["last_report"]
    buy_time = filings[first_report]["report_date"]
    sold_time = filings[last_report]["report_date"]

    return buy_time, sold_time


def analyze_timeseries(cik, global_stock, buy_time, sold_time):
    timeseries_global = global_stock.get("timeseries")
    ticker = global_stock.get("ticker")
    cusip = global_stock.get("cusip")

    if timeseries_global == None or not ticker:
        update_timeseries = True
        try:
            timeseries_info = api.ticker_request("TIME_SERIES_MONTHLY", ticker, cik)[
                "Monthly Time Series"
            ]
        except KeyError:
            timeseries_info = api.ticker_request("TIME_SERIES_MONTHLY", ticker, cik)
        except Exception as e:
            database.add_log(cik, f"Failed to Find Time Data \n{e}", cusip)
            raise LookupError

        timeseries_global = []
        for time_key in timeseries_info:
            info = timeseries_info[time_key]
            try:
                date = convert_date(time_key)
            except:
                continue
            price = {
                "time": date,
                "open": float(info["1. open"]),
                "close": float(info["4. close"]),
                "high": float(info["2. high"]),
                "low": float(info["3. low"]),
                "volume": float(info["5. volume"]),
            }
            # timeseries_local[key] = price
            timeseries_global.append(price)
    else:
        update_timeseries = False

    if timeseries_global != []:
        buy_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - buy_time)
        )
        sold_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - sold_time)
        )
    else:
        buy_timeseries = "NA"
        sold_timeseries = "NA"

    if update_timeseries:
        database.edit_stock(
            {"ticker": ticker}, {"$set": {"timeseries": timeseries_global}}
        )

    return buy_timeseries, sold_timeseries


def analyze_stocks(cik, outdated_stocks, filings):
    total_value = analyze_total(cik, outdated_stocks)
    for outdated_stock in outdated_stocks:
        try:
            name = outdated_stock["name"]
            cusip = outdated_stock["cusip"]

            found_stock = database.find_stock("ticker", cusip)
            if not found_stock:
                continue

            first_report, last_report, buy_time, sold_time = analyze_report(
                outdated_stock, filings
            )
            percent_portfolio, percent_ownership = analyze_value(
                outdated_stock, found_stock, total_value
            )
            buy_timeseries, sold_timeseries = analyze_timeseries(
                cik, found_stock, buy_time, sold_time
            )

            # Shit to do
            # Finish up filings anal
            # Make so filings anal happens before stock anal, and stock
            # anal uses filing anal's already scraped data
            # Functionality so that once filing anal is done, the
            # ultimate stock is already know
            # Perhaps integrate above with process historical?

            outdated_stock.update(
                {
                    "portfolio": percent_portfolio,
                    "ownership": percent_ownership,
                    "prices": {
                        "buy": buy_timeseries,
                        "sold": sold_timeseries,
                    },
                }
            )

            outdated_stocks[cusip] = outdated_stock
            updated_stock = serialize_stock(outdated_stock, found_stock)
            log_stock = {"name": name, "message": "Created Stock", "identifier": cusip}

            yield updated_stock, log_stock

        except Exception as e:
            print("Failed Stock", e)
            database.add_log(cik, "Failed Stock", "NA", "NA")
            continue


def analyze_stocks(cik, filings, updated_stocks):
    stock_cache = {}
    for access_number in filings:
        filing_stocks = filings[access_number]["stocks"]
        total_value = analyze_total(cik, filing_stocks)
        for cusip in filing_stocks:
            stock_query = f"filings.{access_number}.stocks.{cusip}"
            updated_stock = next(
                (s for s in updated_stocks if s["cusip"] == cusip), None
            )

            local_stock = filing_stocks[cusip]
            cusip = local_stock["cusip"]
            name = local_stock["name"]

            buy_time, sold_time = analyze_report(local_stock, filings)

            found_stock = stock_cache.get(cusip)
            found_stock = (
                database.find_stock("cusip", cusip) if not found_stock else found_stock
            )
            if not found_stock:
                continue

            percent_portfolio, percent_ownership = analyze_value(
                local_stock, found_stock, total_value
            )
            buy_timeseries, sold_timeseries = analyze_timeseries(
                cik, found_stock, buy_time, sold_time
            )

            # Shit to do
            # Finish up filings anal
            # Make so filings anal happens before stock anal, and stock
            # anal uses filing anal's already scraped data
            # Functionality so that once filing anal is done, the
            # ultimate stock is already know
            # Perhaps integrate above with process historical?

            if found_stock.get("buy_time", 0) > buy_time:
                stock_cache[cusip] = {
                    **found_stock,
                    "buy_time": buy_time,
                    "sold_time": sold_time,
                }
                filing_stock = {
                    **local_stock,
                    "portfolio": percent_portfolio,
                    "ownership": percent_ownership,
                    "prices": {
                        "buy": buy_timeseries,
                        "sold": sold_timeseries,
                    },
                }
            else:
                filing_stock = local_stock

            updated_stock = serialize_stock(filing_stock, found_stock)
            log_stock = {"name": name, "message": "Created Stock", "identifier": cusip}

            yield stock_query, local_stock, updated_stock, log_stock


def time_remaining(stock_count):
    time_required = stock_count
    return time_required / 5


capital_pattern = re.compile(r"(.)([A-Z][a-z]+)")
underscore_pattern = re.compile(r"([a-z0-9])([A-Z])")


def convert_underscore(dictionary, new_dict={}):
    for key in dictionary:
        if key in new_dict:
            continue

        new_key = capital_pattern.sub(r"\1_\2", key)
        new_key = underscore_pattern.sub(r"\1_\2", new_key).lower()
        new_dict[new_key] = dictionary[key]

    return new_dict


def stock_filter(stocks):
    stock_list = []
    for stock in stocks:
        stock_list.append(stock)


def create_json(cik, filename):
    file_path = f"./public/filers/{filename}"
    try:
        with open(file_path, "r") as f:
            filer_json = json.load(f)
            if (datetime.now().timestamp() - filer_json["updated"]) > 60 * 60 * 3:
                raise ValueError
    except:
        filer = database.find_filer(cik, {"_id": 0, "stocks.global.timeseries": 0})
        with open(file_path, "w") as r:
            json.dump(filer, r, indent=6)

    return file_path


header_format = [
    {"display": "Ticker", "accessor": "ticker_str"},
    {"display": "Name", "accessor": "name"},
    {"display": "Class", "accessor": "class"},
    {"display": "Sector", "accessor": "sector"},
    {"display": "Shares Held (Or Principal Amount)", "accessor": "shares_held_str"},
    {"display": "Market Value", "accessor": "market_value_str"},
    {"display": r"% of Portfolio", "accessor": "portfolio_str"},
    {"display": "% Ownership", "accessor": "ownership_str"},
    {"display": "Sold Date", "accessor": "sold_str"},
    {"display": "Buy Date", "accessor": "buy_str"},
    {"display": "Price Paid", "accessor": "buy_price_str"},
    {"display": "Recent Price", "accessor": "recent_price_str"},
    {"display": r"% Gain", "accessor": "gain_str"},
    {"display": "Industry", "accessor": "industry"},
    {"display": "Report Date", "accessor": "report_str"},
]


# def style_excel(file_path):
#     workbook = xlsxwriter.Workbook(file_path)
#     worksheet = workbook.database.add_worksheet()

#     cell_format = workbook.database.add_format({'bold': True, 'font_color': 'red'})
#     cell_format.set_font_size(16)
#     cell_format.set_underline(2)
#     cell_format.set_align('center')

#     cell_format1 = workbook.database.add_format({'font_color': 'blue'})

#     cell_format1.set_align('center')
#     worksheet.write('A1', 'Name', cell_format)
#     worksheet.write('B1', 'Department', cell_format)
#     row = 1
#     col = 0

#     data = (
#         ['Rajendra', 'Hi, You are on SQLShack.com, refer to all SQL Server related contents.'],
#         ['Kashish','How do you get to see a physiotherapist?'],
#         ['Arun', 'I am a student of class 1 in Bookburn primary school.'],
#         ['Rohan','Are you a Bank Manager?'],
#     )

#     worksheet.set_column('B1:B1', 60)
#     worksheet.set_column('B2:B5',60,cell_format1)
#     worksheet.set_column('A1:A5', 20,cell_format1)

#     for name, score in (data):
#         worksheet.write(row, col, name)
#         worksheet.write(row, col + 1, score)
#         row += 1


def create_dataframe(global_stocks):
    headers = []
    for header in header_format:
        display = header["display"]
        headers.append(display)

    csv_data = [headers]

    for stock in global_stocks:
        stock_display = []
        for header in header_format:
            key = header["accessor"]
            value = stock[key]
            stock_display.append(value)

        csv_data.append(stock_display)

    return csv_data


def create_csv(cik, filename):
    file_path = f"./public/filers/{filename}"
    try:
        with open(file_path, "r"):
            pass
    except:
        filer = database.find_filer(cik, {"stocks.global": 1})
        global_stocks = filer["stocks"]["global"]
        stock_list = create_dataframe(global_stocks)

        with open(file_path, "w") as f:
            writer = csv.writer(f)
            for stock in stock_list:
                writer.writerow(stock)

    return file_path


def end_dangling():
    filers = database.find_logs({"status": {"$gt": 0}})
    ciks = []
    for filer in filers:
        ciks.append(filer["cik"])

    query = {"cik": {"$in": ciks}}
    database.delete_filers(query)
    database.delete_logs(query)

    return ciks


def sort_and_format(filer_ciks):
    filers = []
    project = {
        "cik": 1,
        "name": 1,
        "tickers": 1,
        "market_value": 1,
        "updated": 1,
        "_id": 0,
    }

    for cik in filer_ciks:
        filer = database.find_filer(cik, project)
        if filer != None:
            filers.append(filer)

    try:
        filers_sorted = sorted(
            filers, key=lambda c: c.get("market_value", -1), reverse=True
        )
        for filer in filers_sorted:
            filer["date"] = datetime.utcfromtimestamp(filer["updated"]).strftime(
                "%Y-%m-%d"
            )
            filer["market_value"] = (
                f"${int(filer['market_value']):,}"
                if filer.get("market_value") and filer["market_value"] > 0
                else "NA"
            )
            filer.pop("_id", None)
        return filers_sorted
    except Exception as e:
        print(e)
        raise KeyError


print("[ Analysis Initialized ]")
