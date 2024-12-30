import axios from "axios";
import useSWR from "swr";

const server = process.env.NEXT_PUBLIC_SERVER;
const useStocks = (
  cik,
  headers,
  pagination,
  sort,
  stocks,
  setCount,
  setStocks,
  activate,
  skip,
  paginate
) => {
  const stockFetcher = (url, cik, options) =>
    axios
      .get(url, {
        params: {
          cik,
          limit: options.pagination,
          sort: options.sort,
          offset: options.offset,
          reverse: options.reverse,
          sold: options.sold,
          unavailable: options.na,
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const count = data.count;
          const stocks = data.stocks;

          console.log(options, options.reverse);

          setCount(count);
          setStocks(stocks);
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));

  const { isLoading: loading, error } = useSWR(
    cik ? [server + "/stocks/info", cik, sort] : null,
    ([url, cik, sort]) => stockFetcher(url, cik, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const items = stocks.map((s) => {
    return { ...s, id: s.cusip };
  });
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

export default useStocks;
