import axios from "axios";
import useSWR from "swr";

const server = process.env.NEXT_PUBLIC_SERVER;

interface Selected {
  sort: Sort;
  stocks: Stock[];
  access: string;
  headers: string[];
}

interface Sort {
  sort: string;
  reverse: boolean;
}

interface Stock {
  cusip: string;
  [key: string]: any;
}

interface StockFetcherParams {
  pagination: number;
  sort: string;
  offset: number;
  reverse: boolean;
  sold: boolean;
  na: boolean;
}

const useFilingStocks = (
  cik: string,
  selected: Selected,
  setCount: (count: number) => void,
  setStocks: (stocks: Stock[]) => void,
  activate: boolean,
  skip: boolean,
  paginate: boolean
) => {
  const sort = selected.sort;
  const stocks = selected.stocks;
  const access = selected.access;
  const headers = selected.headers;
  const pagination = selected.sort;

  const stockFetcher = (
    url: string,
    cik: string,
    access: string,
    { pagination, sort, offset, reverse, sold, na }: StockFetcherParams
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
          const stocks = data.stocks;
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