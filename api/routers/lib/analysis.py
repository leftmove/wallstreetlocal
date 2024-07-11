import csv
import json
import re
import os
import logging

from datetime import datetime

from . import database
from . import api
from . import cache
from . import errors


def convert_date(date_str):
    date = (datetime.strptime(date_str, "%Y-%m-%d")).timestamp() if date_str else ""
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

    prices = local_stock.get("prices", {})
    buy_stamp = prices.get("buy", {})
    buy_timeseries = buy_stamp.get("series")
    price_bought = buy_timeseries["close"] if buy_timeseries != "NA" else "NA"
    price_bought_str = f"${price_bought}" if buy_timeseries != "NA" else "NA"

    price_recent = global_stock["price"] if update else "NA"
    price_recent_str = f"${price_recent}" if update else "NA"

    sold_stamp = prices.get("sold", {})
    sold_timeseries = sold_stamp.get("series")
    price_sold = sold_timeseries["close"] if sold_timeseries != "NA" else "NA"
    price_sold_str = f"${price_sold}" if sold_timeseries != "NA" else "NA"

    buy_float = buy_stamp.get("time")
    buy_date = datetime.fromtimestamp(buy_float) if buy_stamp else "NA"
    buy_date_str = (
        f"Q{(buy_date.month-1)//3+1} {buy_date.year}"
        if buy_timeseries != "NA"
        else "NA"
    )

    report_float = local_stock.get("report_time", "NA")
    report_date = (
        datetime.fromtimestamp(local_stock["report_time"])
        if report_float != "NA"
        else "NA"
    )
    report_date_str = (
        f"Q{(report_date.month-1)//3+1} {report_date.year}"
        if report_float != "NA"
        else "NA"
    )

    sold_float = sold_stamp.get("time", "NA") if sold else "NA"
    sold_date = (
        datetime.fromtimestamp(sold_float) if sold and sold_float != "NA" else "NA"
    )
    sold_date_str = (
        f"Q{(sold_date.month-1)//3+1} {sold_date.year}"
        if sold and sold_float != "NA"
        else "NA"
    )

    name = local_stock["name"]
    ticker_str = f"{ticker} (Sold)" if sold and update else ticker

    shares_held = local_stock["shares_held"]
    market_value = local_stock["market_value"]
    portfolio_percentage = local_stock.get("portfolio_percent")
    portfolio_percentage = (
        portfolio_percentage * 100
        if portfolio_percentage and portfolio_percentage != "NA"
        else "NA"
    )
    ownership_percentage = local_stock.get("ownership_percent", "NA")
    ownership_percentage = (
        ownership_percentage * 100 if ownership_percentage != "NA" else "NA"
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
        "{:.2f}".format(round(portfolio_percentage, 4))
        if portfolio_percentage != "NA"
        else "NA"
    )
    ownership_percentage_str = (
        "{:.2f}".format(round(ownership_percentage, 4))
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
        "sold_price": price_sold,
        "sold_price_str": price_sold_str,
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
        "report_time": report_float,
        "report_str": report_date_str,
        "buy_time": buy_float,
        "buy_str": buy_date_str,
        "sold_time": sold_float,
        "sold_str": sold_date_str,
    }


def serialize_local(
    local_stock,
    global_stock,
    filings,
):

    sold = local_stock["sold"]
    records = local_stock["records"]
    prices = local_stock["prices"]
    ratios = local_stock["ratios"]

    first_appearance = records["first_appearance"]
    last_appearance = records["last_appearance"]
    portfolio_percentage = ratios["portfolio_percent"]
    ownership_percentage = ratios["ownership_percent"]

    buy_price = prices["buy"]
    buy_float = buy_price["time"]
    buy_date = datetime.fromtimestamp(buy_float)
    buy_date_str = f"Q{(buy_date.month-1)//3+1} {buy_date.year}"
    buy_series = buy_price["series"]

    sold_price = prices["sold"]
    sold_float = sold_price["time"] if sold else "NA"
    sold_date = datetime.fromtimestamp(sold_float) if sold else "NA"
    sold_date_str = f"Q{(sold_date.month-1)//3+1} {sold_date.year}" if sold else "NA"
    sold_series = sold_price["series"] if sold else "NA"

    portfolio_percentage_str = (
        "{:.2f}".format(round(portfolio_percentage, 4))
        if portfolio_percentage != "NA"
        else "NA"
    )
    ownership_percentage_str = (
        "{:.2f}".format(round(ownership_percentage, 4))
        if ownership_percentage != "NA"
        else "NA"
    )

    serialized_global = serialize_stock(local_stock, global_stock)

    return {
        **serialized_global,
        "sold": sold,
        "ratios": {
            "portfolio_percent": portfolio_percentage,
            "portfolio_str": portfolio_percentage_str,
            "ownership_percent": ownership_percentage,
            "ownership_str": ownership_percentage_str,
        },
        "records": {
            "first_appearance": first_appearance,
            "last_appearance": last_appearance,
        },
        "prices": {
            "buy": {
                "time": buy_float,
                "time_str": buy_date_str,
                "series": buy_series,
            },
            "sold": {
                "time": sold_float,
                "time_str": sold_date_str,
                "series": sold_series,
            },
        },
    }


def analyze_total(cik, stocks, access_number):
    market_values = []
    for key in stocks:
        stock = stocks[key]
        value = stock.get("market_value", 0)
        market_values.append(value)

    total = sum(market_values)
    database.edit_filing(
        {"cik": cik, "access_number": access_number, "form": "13F-HR"},
        {
            "$set": {
                "market_value": total,
            }
        },
    )

    return total


def analyze_value(local_stock, global_stock, total):
    market_value = local_stock["market_value"]
    portfolio_percentage = market_value / total

    global_data = global_stock.get("financials")
    if global_data:
        shares_outstanding = float(global_data.get("shares_outstanding"))
        shares_held = local_stock.get("shares_held")
        ownership_percentage = (
            shares_held / shares_outstanding
            if shares_held and shares_outstanding
            else "NA"
        )
    else:
        ownership_percentage = "NA"

    return portfolio_percentage, ownership_percentage


def analyze_report(local_stock, filings):
    cusip = local_stock["cusip"]
    first_appearance = "NA"
    last_appearance = "NA"

    for filing in filings:
        filing_stocks = filing.get("stocks", [])
        if not filing_stocks:
            continue
        if cusip in filing_stocks:
            access_number = filing["access_number"]
            first_appearance = (
                access_number if first_appearance == "NA" else first_appearance
            )
            last_appearance = access_number

    return first_appearance, last_appearance


def analyze_timeseries(cik, local_stock, global_stock, filings):
    timeseries_global = global_stock.get("timeseries", [])
    ticker = global_stock.get("ticker")
    cusip = global_stock.get("cusip")

    if not timeseries_global and ticker != "NA":
        update_timeseries = True
        try:
            timeseries_response = api.ticker_request("TIME_SERIES_MONTHLY", ticker, cik)
            timeseries_info = timeseries_response.get("Monthly Time Series")
            timeseries_info = (
                timeseries_response if not timeseries_info else timeseries_info
            )

            timeseries_global = []
            for time_key in timeseries_info:
                info = timeseries_info[time_key]
                if time_key == "Error Message" or time_key == "Information":
                    continue

                date = convert_date(time_key)
                price = {
                    "time": date,
                    "open": float(info["1. open"]),
                    "close": float(info["4. close"]),
                    "high": float(info["2. high"]),
                    "low": float(info["3. low"]),
                    "volume": float(info["5. volume"]),
                }
                timeseries_global.append(price)

        except Exception as e:
            database.add_log(cik, f"Failed to Find Time Data \n{e}", cusip)
    else:
        update_timeseries = False

    sold = local_stock["sold"]
    first_appearance = local_stock["records"]["first_appearance"]
    last_appearance = local_stock["records"]["last_appearance"]
    buy_time = filings[first_appearance]["report_date"]
    sold_time = filings[last_appearance]["report_date"] if sold else "NA"

    buy_stamp = {"time": buy_time, "series": "NA"}
    sold_stamp = {"time": sold_time, "series": "NA"}

    if timeseries_global != []:
        buy_timeseries = min(
            timeseries_global, key=lambda x: abs((x["time"]) - buy_time)
        )
        buy_stamp["series"] = buy_timeseries

        sold_timeseries = (
            min(timeseries_global, key=lambda x: abs((x["time"]) - sold_time))
            if sold
            else "NA"
        )
        sold_stamp["series"] = sold_timeseries

    if update_timeseries:
        database.edit_stock(
            {"ticker": ticker}, {"$set": {"timeseries": timeseries_global}}
        )

    return buy_stamp, sold_stamp


def analyze_filings(cik, filings, last_report):
    stock_cache = {}
    filings_map = dict(zip([f["access_number"] for f in filings], filings))
    filings_sorted = sorted([f for f in filings], key=lambda d: d.get("report_date", 0))
    for filing in filings:
        access_number = filing.get("access_number", "")
        filing_stocks = filing.get("stocks")

        if not filing_stocks or not access_number:
            continue

        total_value = analyze_total(cik, filing_stocks, access_number)
        for cusip in filing_stocks:
            try:
                stock_query = access_number
                local_stock = filing_stocks[cusip]
                cusip = local_stock["cusip"]

                first_appearance, last_appearance = analyze_report(
                    local_stock, filings_sorted
                )
                records = {
                    "first_appearance": first_appearance,
                    "last_appearance": last_appearance,
                }
                local_stock["records"] = records

                sold = False if last_appearance == last_report else False
                local_stock["sold"] = sold

                found_stock = stock_cache.get(cusip)
                if not found_stock:
                    found_stock = database.find_stock("cusip", cusip)
                    stock_cache[cusip] = found_stock

                if not found_stock:
                    continue
                is_updated = found_stock.get("update", False)

                portfolio_percentage, ownership_percentage = analyze_value(
                    local_stock, found_stock, total_value
                )
                ratios = {
                    "portfolio_percent": portfolio_percentage,
                    "ownership_percent": ownership_percentage,
                }
                local_stock["ratios"] = ratios

                if found_stock.get("prices"):
                    prices = found_stock["prices"]
                else:
                    buy_stamp, sold_stamp = analyze_timeseries(
                        cik, local_stock, found_stock, filings_map
                    )
                    prices = {"buy": buy_stamp, "sold": sold_stamp}
                    stock_cache[cusip]["prices"] = prices

                local_stock["prices"] = prices

                filing_stock = serialize_local(
                    local_stock,
                    found_stock,
                    filings_map,
                )

                if is_updated:
                    filing_stock.update(
                        {"name": found_stock["name"], "ticker": found_stock["ticker"]}
                    )

                yield stock_query, filing_stock

            except Exception as e:
                logging.error(e)
                database.add_log(
                    cik, "Error Querying Stock for Filings", cusip, access_number
                )


def analyze_stocks(cik, filings):
    stock_cache = {}
    filings_sorted = sorted(filings, key=lambda d: d["report_date"], reverse=True)
    filings_map = dict(zip([f["access_number"] for f in filings], filings))
    for filing in filings_sorted:
        filing_stocks = filing.get("stocks")
        if not filing_stocks:
            continue
        for cusip in filing_stocks:
            try:
                filing_stock = filing_stocks[cusip]
                cusip = filing_stock["cusip"]
                name = filing_stock["name"]

                found_stock = stock_cache.get(cusip)
                if found_stock:
                    continue
                found_stock = (
                    database.find_stock("cusip", cusip)
                    if not found_stock
                    else found_stock
                )
                if not found_stock:
                    continue

                buy_stamp, sold_stamp = analyze_timeseries(
                    cik, filing_stock, found_stock, filings_map
                )
                filing_stock["prices"] = {
                    "buy": buy_stamp,
                    "sold": sold_stamp,
                }

                updated_stock = serialize_stock(filing_stock, found_stock)
                log_stock = {
                    "name": name,
                    "message": "Created Stock",
                    "identifier": cusip,
                }

                stock_cache[cusip] = updated_stock

                filer_stocks = database.search_filer(cik, {"stocks.cusip": 1})["stocks"]
                insert = (
                    False
                    if next(filter(lambda s: s["cusip"] == cusip, filer_stocks), None)
                    else True
                )

                if insert:
                    stock_query = {"$push": {"stocks": updated_stock}}
                else:
                    stock_index = next(
                        (
                            i
                            for i, item in enumerate(filer_stocks)
                            if item["cusip"] == cusip
                        ),
                        -1,
                    )
                    stock_query = {
                        "$set": {"stocks." + str(stock_index): updated_stock}
                    }
                yield stock_query, log_stock

            except Exception as e:
                errors.report_error(cik, e)
                database.add_log(
                    cik,
                    "Error Analyzing Stock for Filings",
                    cusip,
                    filing.get("access_number", "NA"),
                )


def time_remaining(stock_count):
    if stock_count:
        time_required = stock_count / 5
    else:
        time_required = 0
    return time_required


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


def sort_pipeline(
    cik: str,
    limit: int,
    offset: int,
    sort: str,
    sold: bool,
    reverse: bool,
    unavailable: bool,
    additonal: list = [],
    collection_search=database.search_filers,
):
    if limit < 0:
        raise ValueError

    pipeline = [
        {"$match": {"cik": cik}},
    ]
    if additonal:
        pipeline.extend(additonal)

    pipeline.extend(
        [
            {"$unwind": "$stocks"},
            {"$replaceRoot": {"newRoot": "$stocks"}},
            {"$group": {"_id": "$cusip", "doc": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$doc"}},
        ]
    )

    if sold is False:
        pipeline.append({"$match": {"sold": False}})
    if unavailable is False:
        sort_query = f"${sort}"

    cursor = collection_search(pipeline)
    results = [result for result in cursor]
    if not cursor or not results:
        raise LookupError
    count = len(results)

    pipeline.append(
        {"$sort": {sort: 1 if reverse else -1, "_id": 1}},
    )
    if unavailable is False:
        sort_stage = pipeline.pop(-1)
        pipeline.extend(
            [
                {
                    "$set": {
                        "sort_saved": sort_query,
                        sort: {
                            "$cond": {
                                "if": {"$eq": [sort_query, "NA"]},
                                "then": 0,
                                "else": sort_query,
                            }
                        },
                    }
                },
                sort_stage,
                {"$set": {sort: "$sort_saved"}},
                {"$unset": "sort_saved"},
                {"$match": {sort: {"$ne": "NA"}}},
            ]
        )

    pipeline.extend(
        [
            {"$project": {"_id": 0}},
            {"$skip": offset},
            {"$limit": limit},
        ]
    )

    return pipeline, count


cwd = os.getcwd()


def create_json(content, filename):
    file_path = f"{cwd}/static/filers/{filename}"
    try:
        with open(file_path, "r") as f:  # @IgnoreException
            filer_json = json.load(f)
            if (datetime.now().timestamp() - filer_json["updated"]) > 60 * 60 * 3:
                raise ValueError
    except Exception as e:
        print(e)
        with open(file_path, "w") as r:
            json.dump(content, r, indent=6)

    return file_path


default_format = [
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


def create_dataframe(global_stocks, headers=None):
    top_row = []
    if not headers:
        header_format = default_format
    else:
        header_format = []
        for h in headers:
            if h["active"]:
                header_format.append(
                    {"display": h["display"], "accessor": h["accessor"]}
                )

    for header in header_format:
        display = header["display"]
        top_row.append(display)

    csv_data = [top_row]
    for stock in global_stocks:
        stock_display = []
        for header in header_format:
            key = header["accessor"]
            value = stock.get(key, "NA")
            stock_display.append(value)
        csv_data.append(stock_display)

    return csv_data


def create_csv(content, file_name, headers=None):
    file_path = f"{cwd}/static/filers/{file_name}"
    try:
        with open(file_path, "r") as c:  # @IgnoreException
            first_line = c.readline()
            if "Recent Price" in first_line or "% Gain" in first_line:
                value = cache.get_key(file_path)
                if not value:
                    expire_time = 60 * 60 * 24 * 3
                    cache.set_key(file_path, "bababooey", expire_time)
                    raise ValueError
    except Exception as e:
        print(e)
        stock_list = create_dataframe(content, headers)
        with open(file_path, "w") as f:
            writer = csv.writer(f)
            for stock in stock_list:
                writer.writerow(stock)

    return file_path, file_name


def end_dangling():
    filers = database.find_logs({"status": {"$gt": 0}})
    ciks = []
    for filer in filers:
        ciks.append(filer["cik"])

    query = {"cik": {"$in": ciks}}
    database.delete_filers(query)
    database.delete_logs(query)

    query = {"type": "restore", "status": "running"}
    database.delete_logs(query)
    query = {"type": "query", "status": "running"}
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
        if filer:
            filers.append(filer)

    try:
        filers_sorted = [
            {
                **filer,
                "market_value": (
                    0
                    if filer.get("market_value") == "NA"
                    or not filer.get("market_value")
                    else filer.get("market_value")
                ),
            }
            for filer in filers
        ]
        filers_sorted = sorted(
            filers_sorted,
            key=lambda c: c["market_value"],
            reverse=True,
        )
        for filer in filers_sorted:
            try:
                filer["date"] = datetime.utcfromtimestamp(filer["updated"]).strftime(
                    "%Y-%m-%d"
                )
                market_value = filer.get("market_value", 0)
                filer["market_value"] = (
                    f"${int(market_value):,}" if market_value > 0 else "NA"
                )
                filer.pop("_id", None)
            except Exception as e:
                print(e)
                filer["date"] = "NA"
                filer["market_value"] = "NA"
        return filers_sorted
    except Exception as e:
        logging.error(e)
        raise KeyError


# Really janky/inefficient


def analyze_allocation(cik):
    start = datetime.now().timestamp()

    filing_project = {"access_number": 1, "report_date": 1}
    pipeline = [
        {"$match": {"cik": cik, "form": "13F-HR"}},
        {"$project": {**filing_project, "stocks": 1}},
        {"$project": {**filing_project, "stocks": {"$objectToArray": "$stocks"}}},
        {"$project": {**filing_project, "stocks": "$stocks.v"}},
        {"$unwind": "$stocks"},
        {"$set": {"cusip": "$stocks.cusip"}},
        {"$project": {**filing_project, "cusip": 1}},
    ]
    cursor = database.search_filings(pipeline)
    if not cursor:
        raise LookupError
    filings = [result for result in cursor]

    filer = database.search_filer(cik, {"stocks.cusip": 1, "stocks.industry": 1})
    filer_stocks = dict(zip([s["cusip"] for s in filer["stocks"]], filer["stocks"]))

    new_filings = {}
    for filing in filings:
        access_number = filing["access_number"]
        report_date = filing["report_date"]
        if new_filings.get(access_number):
            filing_stocks = new_filings[access_number]["stocks"]
            cusip = filing["cusip"]
            stock = filer_stocks[cusip]
            if stock:
                filing_stocks.append(
                    {
                        "cusip": cusip,
                        "industry": stock["industry"],
                    }
                )

            new_filings[access_number]["stocks"] = filing_stocks
        else:
            cusip = filing["cusip"]
            stock = filer_stocks[cusip]
            if stock:
                new_filings[access_number] = {
                    "report_date": report_date,
                    "stocks": [
                        {
                            "cusip": cusip,
                            "industry": stock["industry"],
                        }
                    ],
                }
            else:
                new_filings[access_number]["stocks"] = []

    allocation_access = []
    allocation_list = []
    for f in new_filings:
        filing = new_filings[f]
        stocks = filing["stocks"]
        industries = {}

        if stocks:
            for s in stocks:
                industry = s["industry"]
                if industries.get(industry):
                    industries[industry]["count"] += 1
                else:
                    industries[industry] = {"count": 1}
            industries["OTHER"] = industries.get("NA", {"count": 1})
            industries.pop("NA", None)

        count = len(stocks)
        for i in industries:
            industries[i]["percentage"] = (industries[i]["count"] / count) * 100

        allocation_access.append(f)
        allocation_list.append(
            {
                "access_number": f,
                "report_date": filing["report_date"],
                "industries": industries,
            }
        )

    end = datetime.now().timestamp()
    completion = end - start

    allocation_statistic = {
        "filings": allocation_access,
    }
    database.add_statistic(cik, "allocation", allocation_statistic, completion)

    return allocation_list


def analyze_aum(cik):
    start = datetime.now().timestamp()

    filings = database.find_filings(cik, {"_id": 0, "stocks": 0})
    aum_access = []
    aum_list = []
    for filing in filings:
        access_number = filing["access_number"]
        aum_access.append(access_number)
        aum_list.append(
            {
                "access_number": access_number,
                "aum": filing.get("market_value", "NA"),
                "report_date": filing["report_date"],
            }
        )

    aum_statistic = {"filings": aum_access}
    end = datetime.now().timestamp()

    completion = end - start
    database.add_statistic(cik, "aum", aum_statistic, completion)

    return aum_list
