import os
import jinja2
import textwrap

from lxml import etree
from datetime import datetime

from routers.lib import database

cwd = os.getcwd()
template_loader = jinja2.FileSystemLoader(searchpath=f"{cwd}/email/templates")
template_env = jinja2.Environment(loader=template_loader)
four_spaces = "    "

cik = "1067983"
new_access = "0000950123-24-011775"
old_access = "0000950123-24-008740"
filer = database.search_filer(cik)
old_filing = database.find_filing(cik, old_access)
new_filing = database.find_filing(cik, new_access)

new_stocks = new_filing["stocks"]
old_stocks = old_filing["stocks"]

name = filer["name"]
tickers = filer["tickers"]
tickers_str = ", ".join(tickers) if tickers else None
market_value = new_filing["market_value"]

outputs = []

for cusip in new_stocks:

    new_stock = new_stocks[cusip]
    old_stock = old_stocks.get(cusip)

    changes = new_stock["changes"]
    prices = new_stock["prices"]

    value = changes["value"]
    shares = changes["shares"]

    buy_price = (
        prices["buy"]["series"]["close"]
        if prices["buy"].get("series") != "N/A"
        else None
    )

    value_action = value["action"]
    share_action = shares["action"]

    if share_action == "N/A" or share_action != "buy":
        continue

    new_buy = True if old_stock is None else False

    stock_name = new_stock["name"]
    stock_ticker = new_stock["ticker"]
    stock_industry = new_stock["industry"]
    stock_price = f"${int(buy_price):,}" if buy_price else "Unknown"
    stock_action = "Buy"

    old_portfolio = (
        round(old_stock["ratios"]["portfolio_percent"], 5) if not new_buy else "N/A"
    )
    new_portfolio = round(new_stock["ratios"]["portfolio_percent"], 5)

    old_value = f"${int(old_stock['market_value']):,}" if not new_buy else "N/A"
    new_value = f"${int(new_stock['market_value']):,}"
    change = f"${int(value['amount']):,}"

    old_shares = f"{int(old_stock['shares_held']):,}" if not new_buy else "N/A"
    new_shares = f"{int(new_stock['shares_held']):,}"
    share_change = f"{int(shares['amount']):,}"

    old_date = (
        datetime.fromtimestamp(old_filing["report_date"]).strftime("%B %d, %Y")
        if not new_buy
        else "N/A"
    )
    new_date = datetime.fromtimestamp(new_filing["report_date"]).strftime("%B %d, %Y")

    summary_meta = (
        f"{name} ({cik}) {f'({tickers_str})' if tickers_str else ''} - {stock_industry}"
    )
    summary_action = f"Bought {share_change} shares of {stock_name} ({stock_ticker}) at {stock_price} per share."
    summary_previous = (
        f"Previously, {name} held {old_shares} shares of {stock_name} ({stock_ticker}) valued at {old_value} ({old_portfolio}% of the portfolio) as of {old_date}."
        if not new_buy
        else f"{name} did not previously hold {stock_name} ({stock_ticker})."
    )
    summary_value = (
        f"The new position is valued at {new_value} ({new_portfolio}% of the portfolio) as of {new_date}. Up from {old_value} ({old_portfolio}% of the portfolio) as of {old_date}."
        if not new_buy
        else f"The new position is valued at {new_value} ({new_portfolio}% of the portfolio) as of {new_date}."
    )
    summary = textwrap.indent(
        f"{summary_meta}\n\n"
        + textwrap.indent(
            f"{summary_action}\n\n{summary_previous}\n\n{summary_value}",
            four_spaces * 3,
        ),
        four_spaces * 2,
    )

    stock_template = template_env.get_template("buy.xml")
    output = stock_template.render(
        name=stock_name,
        ticker=stock_ticker,
        industry=stock_industry,
        summary=summary,
        price=stock_price,
        action=stock_action,
        old_portfolio=old_portfolio,
        new_portfolio=new_portfolio,
        old_value=old_value,
        new_value=new_value,
        change_value=change,
        old_shares=old_shares,
        new_shares=new_shares,
        change_shares=share_change,
        old_date=old_date,
        new_date=new_date,
    )

    outputs.append(output)

with open(f"{cwd}/email/output.xml", "w") as f:

    stock_data = textwrap.indent("\n".join(outputs), four_spaces * 2)
    instruction_template = template_env.get_template("instructions.xml")
    instruction = instruction_template.render(
        data=stock_data,
    )

    f.write(instruction)
