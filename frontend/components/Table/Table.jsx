import styles from "./Table.module.css";
import { useEffect } from "react";

import axios from "axios";
import useSWR from "swr";

import Error from "next/error";

import Loading from "@/components/Loading/Loading";
import Header from "./Headers/Header";
import Row from "./Row/Row";
import Sort from "./Sort/Sort";
import Pagination from "./Pagination/Pagination";

import { useDispatch, useSelector } from "react-redux";
import {
  setStocks,
  selectCik,
  selectStocks,
  selectPagination,
  selectSort,
} from "@/redux/filerSlice";

const server = process.env.NEXT_PUBLIC_SERVER;
const getFetcher = (url, cik, { offset, sold, unavailable }) =>
  axios
    .get(url, { params: { cik: cik } })
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
  useEffect(() => {
    if (data) {
      dispatch(setStocks(data.stocks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (error) return <Error statusCode={404} />;
  if (loading) return <Loading />;

  return (
    <div className={styles["table-container"]}>
      <Sort />
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
      </table>
      <Pagination />
    </div>
  );
};

export default Table;
