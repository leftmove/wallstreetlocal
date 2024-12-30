import styles from "./Index.module.css";
import { useEffect, useState } from "react";

import axios from "axios";

import Error from "next/error";

import { useDispatch, useSelector } from "react-redux";
import {
  setStocks,
  setCount,
  setOffset,
  setPagination,
  sortHeader,
  selectCik,
  selectPagination,
  selectStocks,
  selectSort,
  selectHeaders,
} from "@/redux/filerSlice";

import useStocks from "components/Hooks/useStocks";
import Analysis from "components/Analysis/Analysis";
import Table from "components/Table/Table";
import Sort from "./Sort/Sort";

const server = process.env.NEXT_PUBLIC_SERVER;
const Index = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const stocks = useSelector(selectStocks);

  const {
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
    mutate,
  } = useStocks(
    cik,
    useSelector(selectHeaders), // Headers
    useSelector(selectPagination), // Pagination
    useSelector(selectSort), // Sort
    useSelector(selectStocks), // Stocks
    (s) => dispatch(setCount(s)), // Set count
    (c) => dispatch(setStocks(c)), // Set stocks
    (
      // Activate
      a,
      d
    ) => {
      dispatch(
        sortHeader({
          sort: a,
          reverse: d,
        })
      );
      mutate(); // Trigger a manual revalidation, in case auto-revalidation does not work
    },
    (o) => {
      // Skip
      dispatch(setOffset(o));
    },
    (p) => {
      // Paginate
      dispatch(setPagination(p));
    }
  );

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

  return (
    <>
      <div className={styles["table-container"]}>
        <Analysis icon="filter">
          <Sort />
        </Analysis>
        <Table
          items={items}
          loading={loading}
          headers={headers}
          sort={select}
          reverse={reverse}
          activate={activate}
          pagination={pagination}
          skip={skip}
          paginate={paginate}
        />
      </div>
    </>
  );
};

export default Index;
