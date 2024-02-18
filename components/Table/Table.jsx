import styles from "./Table.module.css";
import { useEffect, useState } from "react";

import axios from "axios";
import useSWR from "swr";

import Error from "next/error";
import Link from "next/link";

import Loading from "@/components/Loading/Loading";
import Unavailable from "@/components/Unavailable/Unavailable";
import Header from "./Headers/Header";
import Row from "./Row/Row";
import Sort from "./Sort/Sort";
import Pagination from "./Pagination/Pagination";
import Tabs from "./Tabs/Tabs";

import { font } from "@fonts";

import { useDispatch, useSelector } from "react-redux";
import {
  setStocks,
  setCount,
  selectCik,
  selectStocks,
  selectSort,
} from "@/redux/filerSlice";

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

const Table = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const stocks = useSelector(selectStocks);
  const sort = useSelector(selectSort);

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
  const [queryStocks, setQueryStocks] = useState(true);

  useEffect(() => {
    if (data) {
      const stocks = data.stocks;
      const count = data.count;

      dispatch(setCount(count));
      dispatch(setStocks(stocks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (queryStocks && stocks.length) {
      axios
        .get(server + "/stocks/query", { params: { cik } })
        .catch((e) => console.error(e));
      setQueryStocks(false);
    }
  }, [stocks]);

  // const [tab, setTab] = useState("historical");

  if (error) return <Error statusCode={404} />;
  if (loading) return <Unavailable type="loading" />;
  if (stocks.length <= 0) return <Unavailable type="stocks" cik={cik} />;

  return (
    <div className={styles["table-container"]}>
      <Sort />
      {/* <Tabs
        tab={tab}
        setHistorical={() => setTab("historical")}
        setRecent={() => setTab("recent")}
      /> */}
      <Pagination />
      <table className={styles["table"]}>
        <thead>
          <Header />
        </thead>
        <tbody>
          {stocks.map((s) => (
            <Row key={s.cusip} stock={s} />
          ))}
        </tbody>
        {loading ? <Loading /> : null}
      </table>
      <Pagination />
    </div>
  );
};

export default Table;
