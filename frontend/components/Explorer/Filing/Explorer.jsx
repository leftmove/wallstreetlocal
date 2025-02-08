import styles from "../Filer/Explorer.module.css";

import Error from "next/error";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  setFilings,
  setComparison,
  selectBuy,
  selectSell,
} from "redux/filerSlice";

import Loading from "components/Loading/Loading";
import Unavailable from "components/Unavailable/Unavailable";
import Index from "components/Index/Filing/Changes/Index";
import Timeline from "components/Explorer/Timeline/Timeline";

const server = process.env.NEXT_PUBLIC_SERVER;
const Explorer = (props) => {
  const dispatch = useDispatch();
  const cik = props.cik;
  const an = props.an;
  const buy = useSelector(selectBuy);
  const sell = useSelector(selectSell);
  const orders = ["buy", "sell"];

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
          const firstIndex =
            data.filings.findIndex((f) => f.access_number === an).toString() ||
            null;
          const secondIndex = (firstIndex === filings.length + 1).toString()
            ? firstIndex + 1
            : null;

          dispatch(setFilings(filings));
          if (buy.access == "" && firstIndex) {
            dispatch(
              setComparison({
                type: "buy",
                access: filings.at(firstIndex).access_number,
              })
            );
          }
          if (sell.access == "" && secondIndex) {
            dispatch(
              setComparison({
                type: "sell",
                access: filings.at(secondIndex).access_number,
              })
            );
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
        <Index order="buy" />
        <div className={styles["table-space"]}></div>
        <Index order="sell" />
      </div>
    </>
  );
};

export default Explorer;
