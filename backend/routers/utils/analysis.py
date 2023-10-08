from datetime import datetime

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
    ticker = local_stock["ticker"] if update else "NA"
    rights = local_stock["class"]
    sold = local_stock["sold"]
    sector = global_stock["sector"] if update else "NA"
    industry = global_stock["industry"] if update else "NA"

    timeseries = global_stock.get("timeseries")
    prices = local_stock.get("prices")
    buy = prices.get("buy")
    sold_timeseries = prices.get("sold")
    price_recent = global_stock["price"] if update else "NA"
    price_bought = buy["close"] if timeseries else "NA"
    price_recent_str = f"${price_recent}" if update else "NA"
    price_bought_str = f"${price_bought}" if timeseries else "NA"

    buy_float = buy["time"] if timeseries else "NA"
    buy_date = datetime.fromtimestamp(buy_float) if timeseries else "NA"
    buy_date_str = f"Q{(buy_date.month-1)//3+1} {buy_date.year}" if timeseries else "NA"

    report_float = local_stock["date"] if timeseries else "NA"
    report_date = datetime.fromtimestamp(local_stock["date"]) if timeseries else "NA"
    report_date_str = (
        f"Q{(report_date.month-1)//3+1} {report_date.year}" if timeseries else "NA"
    )

    sold_float = sold_timeseries["time"] if sold and timeseries else "NA"
    sold_date = datetime.fromtimestamp(sold_float) if sold and timeseries else "NA"
    sold_date_str = (
        f"Q{(sold_date.month-1)//3+1} {sold_date.year}" if sold and timeseries else "NA"
    )

    name = local_stock["name"]
    name_str = f"{name}" if update else "NA"
    name_str = f"{ticker}" if name == "NA" and update else name_str
    ticker_str = f"{ticker} (Sold)" if sold and update and timeseries else ticker

    shares_held = local_stock["shares_held"]
    market_value = local_stock["market_value"]
    portfolio_percentage = local_stock.get("portfolio")
    portfolio_percentage = portfolio_percentage * 100 if portfolio_percentage else "NA"
    ownership_percentage = local_stock.get("ownership")
    ownership_percentage = (
        ownership_percentage * 100
        if ownership_percentage and ownership_percentage != "NA"
        else "NA"
    )
    gain_percent = (
        ((price_recent - price_bought) / price_bought) * 100
        if update and timeseries
        else "NA"
    )
    shares_held_str = f"{int(shares_held):,}"
    market_value_str = f"${int(market_value):,}"
    portfolio_percentage_str = "{:.2f}".format(round(portfolio_percentage, 2))
    ownership_percentage_str = (
        "{:.2f}".format(round(ownership_percentage, 2))
        if ownership_percentage and ownership_percentage != "NA"
        else "NA"
    )
    gain_percent_str = (
        "{:.2f}".format(round(gain_percent, 2)) if update and timeseries else "NA"
    )

    return {
        "name": name_str,
        "cusip": cusip,
        "ticker": ticker,
        "ticker_str": ticker_str,
        "sector": sector,
        "industry": industry,
        "class": rights,
        "update": update,
        "sold": sold,
        "timeseries": timeseries,
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
        "gain_percent": gain_percent,
        "gain_str": gain_percent_str,
        "buy": buy_float,
        "buy_str": buy_date_str,
        "report": report_float,
        "report_str": report_date_str,
        "sold_time": sold_float,
        "sold_str": sold_date_str,
    }


def analyze_filer(cik):
    filer = find_filer(cik)
    filer_name = filer["name"]
    filer_filings = filer["filings"]
    filer_stocks = filer["stocks"]["local"]
    add_log(cik, "Creating Filer", filer_name, cik)

    total_market_value = total_value(filer_stocks)

    global_stocks = {}
    stock_list = []
    cusip_list = list(map(lambda s: filer_stocks[s]["cusip"], filer_stocks))

    cursor = find_stocks("cusip", {"$in": cusip_list})
    for updated_stock in cursor:
        cusip = updated_stock["cusip"]
        global_stocks[cusip] = updated_stock

    for key in list(filer_stocks):
        local_stock = filer_stocks[key]
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

        try:
            timeseries_info = (ticker_request("TIME_SERIES_MONTHLY", ticker, cik))[
                "Monthly Time Series"
            ]
        except Exception as e:
            print(f"Failed {name}\n{e}\n")
            continue

        global_data = global_stock.get("data")
        if global_data:
            shares_outstanding = float(global_data.get("shares_outstanding"))
            shares_held = local_stock["shares_held"]
            percent_ownership = shares_held / shares_outstanding
        else:
            percent_ownership = "NA"

        timeseries_global = []
        # timeseries_local = {}
        for key in timeseries_info:
            info = timeseries_info[key]
            date = convert_date(key)
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

        buy_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - buy_time)
        )
        sold_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - sold_time)
        )

        edit_stock({"ticker": ticker}, {"$set": {"timeseries": timeseries_global}})

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
        filer_stocks[key] = local_stock

        list_stock = serialize_stock(local_stock, global_stock)
        stock_list.append(list_stock)

        add_log(cik, "Created Stock", name, cusip)

    stocks = {
        "local": filer_stocks,
        "global": stock_list,
    }

    add_log(cik, "Finished Creating Filer", filer_name, cik)
    edit_filer(
        {"cik": cik},
        {
            "$set": {
                "status": 0,
                "stocks": stocks,
                "market_value": total_market_value,
                "log.logs": [],
                "log.status": 0,
            }
        },
    )


def analyze_filer_newest(cik, newest_stocks):
    filer = find_filer(cik, {"_id": 0, "stocks": 0})
    filer_filings = filer["filings"]
    filer_stocks = newest_stocks
    filer_name = filer["name"]
    add_log(cik, "Creating Filer", filer_name, cik)

    total_market_value = total_value(filer_stocks)

    global_stocks = {}
    stock_list = []
    cusip_list = list(map(lambda s: filer_stocks[s]["cusip"], filer_stocks))

    cursor = find_stocks("cusip", {"$in": cusip_list})
    for updated_stock in cursor:
        cusip = updated_stock["cusip"]
        global_stocks[cusip] = updated_stock

    for key in list(filer_stocks):
        local_stock = filer_stocks[key]
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

        try:
            timeseries_info = (ticker_request("TIME_SERIES_MONTHLY", ticker, cik))[
                "Monthly Time Series"
            ]
        except Exception as e:
            print(f"Failed {name}\n{e}\n")
            continue

        global_data = global_stock.get("data")
        if global_data:
            shares_outstanding = float(global_data.get("shares_outstanding"))
            shares_held = local_stock["shares_held"]
            percent_ownership = shares_held / shares_outstanding
        else:
            percent_ownership = "NA"

        timeseries_global = []
        # timeseries_local = {}
        for key in timeseries_info:
            info = timeseries_info[key]
            date = convert_date(key)
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

        buy_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - buy_time)
        )
        sold_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - sold_time)
        )

        edit_stock({"ticker": ticker}, {"$set": {"timeseries": timeseries_global}})

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
        filer_stocks[key] = local_stock

        list_stock = serialize_stock(local_stock, global_stock)
        stock_list.append(list_stock)

        add_log(cik, "Created Stock", name, cusip)

    stocks = {
        "local": filer_stocks,
        "global": stock_list,
    }

    add_log(cik, "Finished Creating Filer", filer_name, cik)
    edit_filer(
        {"cik": cik},
        {
            "$set": {
                "status": 2,
                "stocks": stocks,
                "market_value": total_market_value,
                "log.status": 0,
            }
        },
    )


def time_remaining(stock_count):
    time_required = stock_count
    return time_required


def stock_filter(stocks):
    stock_list = []
    for stock in stocks:
        stock_list.append(stock)


print("[ Analysis Initialized ]")
