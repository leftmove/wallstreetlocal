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
const Explorer = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
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
          const filings = data.filings;

          dispatch(setFilings(filings));
          if (buy.access == "") {
            dispatch(
              setComparison({
                type: "buy",
                access: filings[0].access_number,
              })
            );
          }
          if (sell.access == "") {
            dispatch(
              setComparison({
                type: "sell",
                access: filings[1].access_number,
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
    cik ? [server + "/filing/filer", cik] : null,
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
