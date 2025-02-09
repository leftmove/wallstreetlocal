import os
import jinja2

from routers.lib import database

cwd = os.getcwd()
template_loader = jinja2.FileSystemLoader(searchpath=f"{cwd}/email/templates")
template_env = jinja2.Environment(loader=template_loader)

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

print(f"{name} ({cik}) {f'({tickers_str})' if tickers_str else ''}")

for cusip in new_stocks:

    new_stock = new_stocks[cusip]
    old_stock = old_stocks.get(cusip)

    changes = new_stock  # Change later
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

    summary_action = "Bought "

    stock_name = new_stock["name"]
    stock_ticker = new_stock["ticker"]
    stock_industry = new_stock["industry"]
    stock_price = buy_price if buy_price else "Unknown"

    old_portfolio = old_stocks if new_buy else "N/A"
    new_portfolio = new_stock["ratios"][""]

    stock_template = template_env.get_template("buy.xml")
    output = stock_template.render(
        name=name,
        cusip=cusip,
        market_value=market_value,
        buy_price=buy_price,
        shares=shares,
        value=value,
    )

    print(output)
