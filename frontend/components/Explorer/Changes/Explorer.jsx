import styles from "../Filer/Explorer.module.css";
import { useEffect } from "react";

import Error from "next/error";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  setFilings,
  setComparison,
  selectBuy,
  selectHold,
  selectSell,
  editComparison,
} from "redux/filerSlice";

import Loading from "components/Loading/Loading";
import Unavailable from "components/Unavailable/Unavailable";
import Index from "@/components/Index/Filing/Changes/Index";
import Timeline from "components/Explorer/Timeline/Timeline";

const server = process.env.NEXT_PUBLIC_SERVER;
const Explorer = (props) => {
  const dispatch = useDispatch();
  const cik = props.cik;
  const an = props.an;
  const orders = ["buy", "hold", "sell"];

  const buy = useSelector(selectBuy);
  const hold = useSelector(selectHold);
  const sell = useSelector(selectSell);

  // useEffect(() => {
  //   orders.map((order) => {
  //     const selected = (() => {
  //       switch (order) {
  //         case "buy":
  //           return buy;
  //         case "hold":
  //           return hold;
  //         case "sell":
  //           return sell;
  //         default:
  //           return buy;
  //       }
  //     })();
  //     dispatch(
  //       editComparison({
  //         sort: {
  //           ...selected.sort,
  //           limit: Math.min(buy.pagination, hold.pagination, sell.pagination),
  //         },
  //       })
  //     );
  //   });
  // }, [buy.stocks, hold.stocks, sell.stocks]);

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
          const filings = data.filings
            .sort((a, b) => a.report_date - b.report_date)
            .reverse();
          const index =
            data.filings.findIndex((f) => f.access_number === an).toString() ||
            null;

          dispatch(setFilings(filings));
          if (buy.access == "" && index) {
            dispatch(
              setComparison({
                type: "buy",
                access: filings.at(index).access_number,
              })
            );
          }
          if (sell.access == "" && index) {
            dispatch(
              setComparison({
                type: "sell",
                access: filings.at(index).access_number,
              })
            );
            if (hold.access == "" && index) {
              dispatch(
                setComparison({
                  type: "hold",
                  access: filings.at(index).access_number,
                })
              );
            }
          }
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: loading, error } = useSWR(
    cik && an ? [server + "/filing/filer", cik] : null,
    ([url, cik]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) return <Unavailable />;

  return (
    <>
      <Timeline orders={orders} />
      <div className={styles["explorer-tables"]}>
        {loading ? <Loading /> : null}
        <Index order="buy" an={an} />
        <div className={styles["table-space"]}></div>
        <Index order="hold" an={an} />
        <div className={styles["table-space"]}></div>
        <Index order="sell" an={an} />
      </div>
    </>
  );
};

export default Explorer;
