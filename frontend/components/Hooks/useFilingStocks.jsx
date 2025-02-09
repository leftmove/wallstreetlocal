import axios from "axios";
import useSWR from "swr";

// Lazy and bad, but works for now
// Advantage is that things can be translated client-side

const serializeLocalToGlobal = (localStock) => {
  const cusip = localStock.cusip;
  const name = localStock.name || "N/A";
  const ticker = localStock.ticker || "N/A";
  const sector = localStock.sector || "N/A";
  const industry = localStock.industry || "N/A";
  const rights = localStock.class || "N/A";
  const sold = localStock.sold || false;
  const update = localStock.update || false;
  const tickerStr = sold ? `${ticker} (Sold)` : ticker;

  const sharesHeld = localStock.shares_held || "N/A";
  const sharesHeldStr = localStock.shares_held_str || "N/A";
  const marketValue = localStock.market_value || "N/A";
  const marketValueStr = localStock.market_value_str || "N/A";

  const prices = localStock.prices || {};
  const buyPrice = prices.buy || {};
  const buyTime = buyPrice.time;
  const buyDateStr = buyPrice.time_str || "N/A";
  const buySeries = buyPrice.series || "N/A";
  const buyPriceVal = buySeries !== "N/A" ? buySeries.close : "N/A";
  const buyPriceStr = buySeries !== "N/A" ? `$${buyPriceVal}` : "N/A";

  const soldPrice = prices.sold || {};
  const soldTime = soldPrice.time;
  const soldDateStr = soldPrice.time_str || "N/A";
  const soldSeries = soldPrice.series || "N/A";
  const soldPriceVal = soldSeries !== "N/A" ? soldSeries.close : "N/A";
  const soldPriceStr = soldSeries !== "N/A" ? `$${soldPriceVal}` : "N/A";

  const ratios = localStock.ratios || {};
  const portfolioPercentage = ratios.portfolio_percent || "N/A";
  const portfolioStr = ratios.portfolio_str || "N/A";
  const ownershipPercentage = ratios.ownership_percent || "N/A";
  const ownershipStr = ratios.ownership_str || "N/A";

  const changes = localStock.changes || {};
  const valueChange = changes.value || {};
  const shareChange = changes.shares || {};

  const valueAction = valueChange.action || "N/A";
  const shareAction = shareChange.action || "N/A";

  const valueBought = valueChange.gain || "N/A";
  const valueSold = valueChange.loss || "N/A";
  const shareBought = shareChange.gain || "N/A";
  const shareSold = shareChange.loss || "N/A";

  const valueBoughtStr =
    valueBought !== "N/A"
      ? `$${parseInt(valueBought).toLocaleString()}`
      : "N/A";
  const valueSoldStr =
    valueSold !== "N/A" ? `$${parseInt(valueSold).toLocaleString()}` : "N/A";
  const shareBoughtStr =
    shareBought !== "N/A" ? parseInt(shareBought).toLocaleString() : "N/A";
  const shareSoldStr =
    shareSold !== "N/A" ? parseInt(shareSold).toLocaleString() : "N/A";

  return {
    name,
    cusip,
    ticker,
    ticker_str: tickerStr,
    sector,
    industry,
    class: rights,
    update,
    sold,
    recent_price: "N/A",
    recent_price_str: "N/A",
    buy_price: buyPriceVal,
    buy_price_str: buyPriceStr,
    sold_price: soldPriceVal,
    sold_price_str: soldPriceStr,
    shares_held: sharesHeld,
    shares_held_str: sharesHeldStr,
    market_value: marketValue,
    market_value_str: marketValueStr,
    portfolio_percent: portfolioPercentage,
    portfolio_str: portfolioStr,
    ownership_percent: ownershipPercentage,
    ownership_str: ownershipStr,
    gain_value: "N/A",
    gain_value_str: "N/A",
    gain_percent: "N/A",
    gain_str: "N/A",
    value_action: valueAction,
    share_action: shareAction,
    value_bought: valueBought,
    value_bought_str: valueBoughtStr,
    value_sold: valueSold,
    value_sold_str: valueSoldStr,
    share_bought: shareBought,
    share_bought_str: shareBoughtStr,
    share_sold: shareSold,
    share_sold_str: shareSoldStr,
    buy_time: buyTime,
    buy_str: buyDateStr,
    sold_time: soldTime,
    sold_str: soldDateStr,
  };
};

const server = process.env.NEXT_PUBLIC_SERVER;
const useFilingStocks = (
  cik,
  selected,
  setCount,
  setStocks,
  activate,
  skip,
  paginate,
  post = (s) => {
    return s;
  }
) => {
  const order = selected.type;
  const sort = selected.sort;
  const stocks = selected.stocks;
  const access = selected.access;
  const headers = selected.headers;
  const pagination = selected.sort;

  const stockFetcher = (
    url,
    cik,
    access,
    { pagination, sort, offset, reverse, sold, na, projections },
    order = "none" // Dummy parameter to make identical requests distinct
  ) =>
    axios
      .get(url, {
        params: {
          cik,
          access_number: access,
          limit: pagination,
          sort,
          offset,
          reverse,
          sold,
          unavailable: na,
          projections: `[${projections}]`,
          order,
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const stocks = post(
            data.stocks
              .map((s) => serializeLocalToGlobal(s))
              .map((s) => {
                return { ...s, id: s.cusip };
              })
          );
          const count = data.count;

          setCount(count);
          setStocks(stocks);
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: loading, error } = useSWR(
    cik && order && access
      ? [server + "/stocks/filing", cik, access, sort, order]
      : null,
    ([url, cik, access, sort, order]) =>
      stockFetcher(url, cik, access, sort, order),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const items = stocks
    ? stocks.map((s) => {
        return { ...s, id: s.cusip };
      })
    : [];
  const select = sort.sort;
  const reverse = sort.reverse;

  return {
    items,
    loading,
    error,
    headers,
    pagination,
    select,
    reverse,
    activate,
    skip,
    paginate,
  };
};

export default useFilingStocks;
