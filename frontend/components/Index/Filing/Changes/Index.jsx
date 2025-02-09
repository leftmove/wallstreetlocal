import styles from "components/Explorer/Filer/Explorer.module.css";
import { useState } from "react";

import useSWR from "swr";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectFilings,
  selectBuy,
  selectHold,
  selectSell,
  setComparison,
  setFilings,
  editComparison,
  editSort,
  setFilingCount,
} from "redux/filerSlice";

import useFilingStocks from "components/Hooks/useFilingStocks";
import Table from "components/Table/Table";

const server = process.env.NEXT_PUBLIC_SERVER;

export default function Index(props) {
  const order = props.order || "buy";
  const an = props.an || "";

  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const selected = useSelector(
    (() => {
      switch (order) {
        case "buy":
          return selectBuy;
        case "hold":
          return selectHold;
        case "sell":
          return selectSell;
        default:
          return selectBuy;
      }
    })()
  );
  const [empty, setEmpty] = useState(false);

  const filingFetcher = (url, cik) =>
    axios
      .get(url, {
        params: {
          cik,
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const filings = data.filings;

          dispatch(setFilings(filings));
          dispatch(setComparison({ type: order, access: an }));
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: filingLoading, filingError } = useSWR(
    // This request is sent too many times cause it repeats for every table.
    cik ? [server + "/filing/filer", cik] : null,
    ([url, cik]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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
  } = useFilingStocks(
    cik,
    selected,
    (count) => dispatch(setFilingCount({ type: order, count })),
    (stocks) => dispatch(editComparison({ type: order, stocks })),
    (accessor, direction) =>
      dispatch(
        editSort({
          type: order,
          sort: accessor,
          reverse: direction,
        })
      ),
    (offset) => dispatch(editSort({ type: order, offset })),
    (pagination) => dispatch(editSort({ type: order, pagination })),
    (stocks) => {
      if (order === "buy") {
        stocks = stocks.filter((s) => s.share_action === "buy");
      } else if (order === "sell") {
        stocks = stocks.filter((s) => s.share_action === "sell");
      } else if (order === "hold") {
        stocks = stocks.filter((s) => s.share_action === "hold");
      }

      if (stocks.length <= 0) {
        const error = new Error("No stocks to retrieve.");

        // console.error(error);
        setEmpty(true);
      }

      return stocks;
    }
  );

  const title = (() => {
    switch (order) {
      case "buy":
        return "Bought Stocks";
      case "hold":
        return "Held Stocks";
      case "sell":
        return "Sold Stocks";
      default:
        return "Changed Stocks";
    }
  })();

  if (empty) return null;

  return (
    <div className={styles["table-container"]}>
      <h1 className="w-full mb-4 text-xl font-semibold text-center font-switzer ">
        {title}
      </h1>
      {/* {error ? <Error statusCode={404} /> : null} */}
      <Table
        items={items}
        loading={loading}
        headers={headers}
        reverse={reverse}
        skip={skip}
        sort={select}
        activate={activate}
        paginate={paginate}
        pagination={pagination}
      />
    </div>
  );
}
