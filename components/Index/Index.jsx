import styles from "./Index.module.css";
import { useEffect, useState } from "react";

import axios from "axios";
import useSWR from "swr";

import Error from "next/error";

import { useDispatch, useSelector } from "react-redux";
import {
  setStocks,
  setCount,
  sortHeader,
  selectCik,
  selectStocks,
  selectSort,
  selectHeaders,
} from "@/redux/filerSlice";

import Unavailable from "@/components/Unavailable/Unavailable";
import Loading from "@/components/Loading/Loading";
import Table from "@/components/Table/Table";
import Sort from "./Sort/Sort";
import Pagination from "./Pagination/Pagination";

const server = process.env.NEXT_PUBLIC_SERVER;
const getFetcher = (
  url,
  cik,
  { pagination, sort, offset, reverse, sold, na }
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
    .then((r) => {
      if (r.status == 201 || r.status == 429) {
        const error = new Error("Filer building.");
        error.info = r.data;
        error.status = r.status;

        throw error;
      }
      return r.data;
    })
    .catch((e) => console.error(e));

const Index = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const sort = useSelector(selectSort);
  const stocks = useSelector(selectStocks);
  const headers = useSelector(selectHeaders);

  const {
    data,
    error,
    isLoading: loading,
  } = useSWR(
    cik ? [server + "/stocks/info", cik, sort] : null,
    ([url, cik, sort]) => getFetcher(url, cik, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data) {
      const stocks = data.stocks;
      const count = data.count;

      dispatch(setCount(count));
      dispatch(setStocks(stocks));
    }
  }, [data]);

  const [queryStocks, setQueryStocks] = useState(true);
  useEffect(() => {
    if (queryStocks && stocks.length) {
      axios
        .get(server + "/stocks/query", { params: { cik } })
        .catch((e) => console.error(e));
      setQueryStocks(false);
    }
  }, [stocks]);

  if (error) return <Error statusCode={404} />;
  if (stocks.length <= 0) return <Unavailable type="stocks" cik={cik} />;

  const select = sort.sort;
  const reverse = sort.reverse;
  const items = stocks.map((s) => {
    return { ...s, id: s.cusip };
  });
  const activate = (accessor, direction) =>
    dispatch(
      sortHeader({
        sort: accessor,
        reverse: direction,
      })
    );

  if (reverse) {
    console.log(reverse);
  }

  return (
    <div className={styles["table-container"]}>
      <Sort />
      <Pagination />
      <Table
        items={items}
        loading={loading}
        headers={headers}
        sort={select}
        reverse={reverse}
        activate={activate}
      />
      <Pagination />
    </div>
  );
};

export default Index;
