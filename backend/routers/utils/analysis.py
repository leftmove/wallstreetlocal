from datetime import datetime
import csv
import json

# import xlsxwriter

from .mongo import *
from .api import *
from .scrape import *

# pyright: reportGeneralTypeIssues=false
# pyright: reportOptionalSubscript=false


print("[ Analysis Initializing ] ...")


def convert_date(date_str):
    date = (datetime.strptime(date_str, "%Y-%m-%d")).timestamp()
    return date


def total_value(stocks):
    market_values = []
    for key in stocks:
        stock = stocks[key]
        if stock["sold"] == False:
            market_values.append(stock["market_value"])
    return sum(market_values)


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

# fix bindings
# fix api rate limit bindings


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


def analyze_filer(cik, local_stocks, batch_limit):
    filer = find_filer(cik, {"_id": 0, "stocks": 0})
    filer_filings = filer["filings"]

    total_market_value = total_value(local_stocks)
    local_stocks_old = dict(local_stocks)
    stock_list = []
    log_list = []

    batch = 0
    for key in local_stocks_old:
        try:
            local_stock = local_stocks_old[key]
            name = local_stock["name"]
            cusip = local_stock["cusip"]

            market_value = local_stock["market_value"]

            first_report = local_stock["first_report"]
            last_report = local_stock["last_report"]
            buy_time = filer_filings[first_report]["report_date"]
            sold_time = filer_filings[last_report]["report_date"]

            percent_portfolio = market_value / total_market_value

            ticker = local_stock["ticker"]
            global_stock = find_stock("ticker", ticker)
            if global_stock == None:
                continue

            timeseries_global = global_stock.get("timeseries")
            if timeseries_global == None:
                update_timeseries = True
                try:
                    timeseries_info = ticker_request(
                        "TIME_SERIES_MONTHLY", ticker, cik
                    )["Monthly Time Series"]
                except KeyError:
                    timeseries_info = ticker_request("TIME_SERIES_MONTHLY", ticker, cik)
                except Exception as e:
                    print(f"Failed to Find Time Data {name}\n{e}\n")
                    continue

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
                edit_stock(
                    {"ticker": ticker}, {"$set": {"timeseries": timeseries_global}}
                )

            try:
                global_data = global_stock["data"]
                shares_outstanding = float(global_data["shares_outstanding"])
                shares_held = local_stock["shares_held"]
                percent_ownership = shares_held / shares_outstanding
            except:
                percent_ownership = "NA"

            global_update = global_stock["update"]
            global_data = global_stock["data"] if global_update else "NA"
            local_stock.update(
                {
                    "portfolio": percent_portfolio,
                    "ownership": percent_ownership,
                    "prices": {
                        "buy": buy_timeseries,
                        "sold": sold_timeseries,
                    },
                }
            )
            local_stocks[key] = local_stock

            list_stock = serialize_stock(local_stock, global_stock)
            log_stock = {"name": name, "message": "Created Stock", "identifier": cusip}

            stock_list.append(list_stock)
            log_list.append(log_stock)
            batch += 1

            if batch >= batch_limit:
                edit_filer(
                    {"cik": cik}, {"$push": {"stocks.global": {"$each": stock_list}}}
                )
                edit_filer({"cik": cik}, {"$set": {"stocks.local": local_stocks}})
                add_logs(cik, log_list)

                batch = 0
                local_stocks = {}
                stock_list = []
                log_list = []

        except Exception as e:
            print("Failed Stock", e)
            add_log(cik, "Failed Stock", "NA", "NA")
            continue

    if batch > 0:
        edit_filer({"cik": cik}, {"$push": {"stocks.global": {"$each": stock_list}}})
        add_logs(cik, log_list)

    edit_filer(
        {"cik": cik},
        {
            "$set": {
                "market_value": total_market_value,
            }
        },
    )


def analyze_historical(cik):
    filer = find_filer(cik)
    filer_name = filer["name"]
    filer_stocks = filer["stocks"]["local"]

    add_log(cik, "Creating Filer (Historical)", filer_name, cik)
    analyze_filer(cik, filer_stocks, 4000)

    add_log(cik, "Created Filer (Historical)", filer_name, cik)
    edit_log(cik, {"stop": datetime.now().timestamp()})
    edit_status(cik, 0)


def analyze_newest(cik, newest_stocks):
    filer = find_filer(cik, {"name": 1})
    filer_name = filer["name"]

    add_log(cik, "Creating Filer (Newest)", filer_name, cik)
    analyze_filer(cik, newest_stocks, 5)

    add_log(cik, "Created Filer (Newest)", filer_name, cik)
    edit_status(cik, 2)


def time_remaining(stock_count):
    time_required = stock_count
    return time_required / 5


def stock_filter(stocks):
    stock_list = []
    for stock in stocks:
        stock_list.append(stock)


def create_json(cik, filename):
    file_path = f"./public/filers/{filename}"
    try:
        with open(file_path, "r"):
            pass
    except:
        filer = find_filer(cik, {"_id": 0, "stocks.global.timeseries": 0})
        print(filer)
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
#     worksheet = workbook.add_worksheet()

#     cell_format = workbook.add_format({'bold': True, 'font_color': 'red'})
#     cell_format.set_font_size(16)
#     cell_format.set_underline(2)
#     cell_format.set_align('center')

#     cell_format1 = workbook.add_format({'font_color': 'blue'})

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
        filer = find_filer(cik, {"stocks.global": 1})
        global_stocks = filer["stocks"]["global"]
        stock_list = create_dataframe(global_stocks)

        with open(file_path, "w") as f:
            writer = csv.writer(f)
            for stock in stock_list:
                writer.writerow(stock)

    return file_path


def end_dangling():
    filers = find_logs({"status": {"$gt": 0}})
    ciks = []
    for filer in filers:
        ciks.append(filer["cik"])

    query = {"cik": {"$in": ciks}}
    delete_filers(query)
    delete_logs(query)

    return ciks


print("[ Analysis Initialized ]")
