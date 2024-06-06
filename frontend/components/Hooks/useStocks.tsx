import axios from "axios";
import useSWR from "swr";

const server = process.env.NEXT_PUBLIC_SERVER;

type Stock = {
  cusip: string;
  [key: string]: any;
};

type Sort = {
  sort: string;
  reverse: boolean;
};

type Pagination = {
  limit: number;
  offset: number;
};

type StockFetcherParams = {
  pagination: number;
  sort: string;
  offset: number;
  reverse: boolean;
  sold: boolean;
  na: boolean;
};

const useStocks = (
  cik: string,
  headers: any,
  pagination: Pagination,
  sort: Sort,
  stocks: Stock[],
  setCount: (count: number) => void,
  setStocks: (stocks: Stock[]) => void,
  activate: boolean,
  skip: boolean,
  paginate: boolean
) => {
  const stockFetcher = (
    url: string,
    cik: string,
    { pagination, sort, offset, reverse, sold, na }: StockFetcherParams
  ) =>
    axios
      .get(url, {
        params: {
          cik,
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
          const count = data.count;
          const stocks = data.stocks;

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