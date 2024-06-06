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

const server: string | undefined = process.env.NEXT_PUBLIC_SERVER;

interface Stock {
  // Define the properties of a stock item here
}

interface Pagination {
  // Define the properties of pagination here
}

const Index: React.FC = () => {
  const dispatch = useDispatch();
  const cik: string = useSelector(selectCik);
  const stocks: Stock[] = useSelector(selectStocks);

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
  } = useStocks(
    cik,
    useSelector(selectHeaders),
    useSelector(selectPagination),
    useSelector(selectSort),
    useSelector(selectStocks),
    (s: number) => dispatch(setCount(s)),
    (c: Stock[]) => dispatch(setStocks(c)),
    (a: string, d: boolean) =>
      dispatch(
        sortHeader({
          sort: a,
          reverse: d,
        })
      ),
    (o: number) => {
      dispatch(setOffset(o));
    },
    (p: Pagination) => {
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