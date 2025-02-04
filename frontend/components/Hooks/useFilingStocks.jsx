import axios from "axios";
import useSWR from "swr";

// Lazy and bad, but works for now
// Advantage is that things can be translated client-side

function serializeLocalToGlobal(localStock) {
  const {
    name,
    cusip,
    ticker,
    sector,
    industry,
    class: rights,
    shares_held,
    shares_held_str,
    market_value,
    market_value_str,
    sold,
    update,
    ratios,
    changes,
    records,
    prices,
    report_time = "N/A",
    recent_price = "N/A",
  } = localStock;

  const {
    portfolio_percent: portfolio_percentage,
    portfolio_str: portfolio_percentage_str,
    ownership_percent: ownership_percentage,
    ownership_str: ownership_percentage_str,
  } = ratios;

  const { value: value_changes, shares: share_changes } = changes;

  const { amount: value_amount, action: value_action } = value_changes;
  const { amount: share_amount, action: share_action } = share_changes;

  const { buy: buy_price, sold: sold_price } = prices;

  const {
    time: buy_time,
    time_str: buy_time_str,
    series: buy_series,
  } = buy_price;

  const value_bought = value_action === "buy" ? Math.abs(value_amount) : 0;
  const value_sold = value_action === "sell" ? Math.abs(value_amount) : 0;
  const shares_bought = share_action === "buy" ? Math.abs(share_amount) : 0;
  const shares_sold = share_action === "sell" ? Math.abs(share_amount) : 0;

  const value_bought_str = value_bought.toFixed(2);
  const value_sold_str = value_sold.toFixed(2);
  const shares_bought_str = shares_bought.toFixed(2);
  const shares_sold_str = shares_sold.toFixed(2);

  const sold_time = sold_price ? sold_price.time : "N/A";
  const sold_time_str = sold_price ? sold_price.time_str : "N/A";
  const sold_series = sold_price ? sold_price.series : "N/A";

  const report_date =
    report_time !== "N/A" ? new Date(report_time * 1000) : "N/A";
  const report_date_str =
    report_time !== "N/A"
      ? `Q${
          Math.floor(report_date.getMonth() / 3) + 1
        } ${report_date.getFullYear()}`
      : "N/A";

  const price_bought = buy_series !== "N/A" ? buy_series.close : "N/A";
  const price_bought_str = buy_series !== "N/A" ? `$${price_bought}` : "N/A";

  const price_sold = sold_series !== "N/A" ? sold_series.close : "N/A";
  const price_sold_str = sold_series !== "N/A" ? `$${price_sold}` : "N/A";

  const recent_price_str = recent_price !== "N/A" ? `$${recent_price}` : "N/A";

  const gain_value =
    recent_price !== "N/A" && price_bought !== "N/A"
      ? parseFloat(recent_price - price_bought)
      : "N/A";
  const gain_percent =
    gain_value !== "N/A" && price_bought !== "N/A"
      ? parseFloat((gain_value / price_bought) * 100)
      : "N/A";
  const gain_value_str = gain_value !== "N/A" ? gain_value.toFixed(2) : "N/A";
  const gain_percent_str =
    gain_percent !== "N/A" ? gain_percent.toFixed(2) : "N/A";

  return {
    name,
    cusip,
    ticker,
    sector,
    industry,
    class: rights,
    update,
    sold,
    recent_price,
    recent_price_str,
    buy_price: price_bought,
    buy_price_str: price_bought_str,
    sold_price: price_sold,
    sold_price_str: price_sold_str,
    shares_held,
    shares_held_str,
    market_value,
    market_value_str,

    portfolio_percent: portfolio_percentage,
    portfolio_str: portfolio_percentage_str,
    ownership_percent: ownership_percentage,
    ownership_str: ownership_percentage_str,
    gain_value,
    gain_value_str,
    gain_percent,
    gain_str: gain_percent_str,
    report_time,
    report_str: report_date_str,
    buy_time,
    buy_str: buy_time_str,
    sold_time,
    sold_str: sold_time_str,
  };
}

const server = process.env.NEXT_PUBLIC_SERVER;
const useFilingStocks = (
  cik,
  selected,
  setCount,
  setStocks,
  activate,
  skip,
  paginate
) => {
  const sort = selected.sort;
  const stocks = selected.stocks;
  const access = selected.access;
  const headers = selected.headers;
  const pagination = selected.sort;

  const stockFetcher = (
    url,
    cik,
    access,
    { pagination, sort, offset, reverse, sold, na }
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
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const stocks = data.stocks.map((s) => serializeLocalToGlobal(s));
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
    cik && access ? [server + "/stocks/filing", cik, access, sort] : null,
    ([url, cik, access, sort]) => stockFetcher(url, cik, access, sort),
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
