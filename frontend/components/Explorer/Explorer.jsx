import styles from "./Explorer.module.css";

import Error from "next/error";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectPrimary,
  setFilings,
  setComparison,
  selectSecondary,
} from "@/redux/filerSlice";

import Loading from "components/Loading/Loading";
import Unavailable from "components/Unavailable/Unavailable";
import Index from "../Index/Filing/Explorer/Index";
import Timeline from "./Timeline/Timeline";

const server = process.env.NEXT_PUBLIC_SERVER;

// Most janky code I've ever written. Really, just the worst.
// I made some mistakes in the infrastructure making the stocks table,
// and now as I repeat the code here, the same mistakes are amplified
// greatly. Way too much repitition, partly my own fault, but
// (I think) mostly due to React's at times terrible data fetching
// system(s). Libraries help at first, then make it worse later.
// TLDR: Fix later.

const Explorer = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const primary = useSelector(selectPrimary);
  const secondary = useSelector(selectSecondary);

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
          if (primary.access == "") {
            dispatch(
              setComparison({
                type: "primary",
                access: filings[0].access_number,
              })
            );
          }
          if (secondary.access == "") {
            dispatch(
              setComparison({
                type: "secondary",
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
      <Timeline />
      <div className={styles["explorer-tables"]}>
        {loading ? <Loading /> : null}
        <Index order="primary" />
        <div className={styles["table-space"]}></div>
        <Index order="secondary" />
      </div>
    </>
  );
};

export default Explorer;
