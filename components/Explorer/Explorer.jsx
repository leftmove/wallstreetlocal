import styles from "./Explorer.module.css";
import { useEffect } from "react";

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
  setFilingStocks,
  setFilingCount,
} from "@/redux/filerSlice";

import Table from "@/components/Table/Table";
import Unavailable from "@/components/Unavailable/Unavailable";
import Timeline from "./Timeline/Timeline";

const server = process.env.NEXT_PUBLIC_SERVER;
const filingFetcher = (url, cik) =>
  axios
    .get(url, {
      params: {
        cik,
      },
    })
    .then((r) => r.data)
    .catch((e) => console.error(e));
const stockFetcher = (
  url,
  cik,
  access,
  { pagination, sort, offset, reverse, sold, na }
) =>
  axios
    .get(url, {
      params: {
        cik,
        access_number: access,
        limit: pagination,
        sort,
        offset,
        reverse,
        sold,
        unavailable: na,
      },
    })
    .then((r) => r.data)
    .catch((e) => console.error(e));

// Most janky code I've ever written. Really, just the worst.
// I made some mistakes in the infastructure making the stocks table,
// and now as I repeat the code here, the same mistakes are amplifed
// greatly. Way too much repitition, partly my own fault, but
// (I think) mostly due to React's at times terrible data fetching
// system(s). Libraries help at first, then make it worse later.
// TLDR: Fix later.

const Explorer = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);

  const primary = useSelector(selectPrimary);
  const secondary = useSelector(selectSecondary);
  const primaryAccess = primary.access;
  const secondaryAccess = secondary.access;

  const { data, error } = useSWR(
    cik ? [server + "/filers/filings", cik] : null,
    ([url, cik]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  useEffect(() => {
    if (data) {
      const filings = data.filings;
      dispatch(setFilings(filings));
      if (primaryAccess == "") {
        dispatch(
          setComparison({ type: "primary", access: filings[0].access_number })
        );
      }
      if (secondaryAccess == "") {
        dispatch(
          setComparison({ type: "secondary", access: filings[1].access_number })
        );
      }
    }
  }, [data]);

  const { primaryData, isLoading: primaryLoading } = useSWR(
    cik && primaryAccess
      ? [server + "/stocks/filing", cik, primaryAccess, sort]
      : null,
    ([url, cik, primaryAccess, sort]) =>
      stockFetcher(url, cik, primaryAccess, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const { secondaryData, isLoading: secondaryLoading } = useSWR(
    cik && secondaryAccess
      ? [server + "/stocks/filing", cik, secondaryAccess, sort]
      : null,
    ([url, cik, secondaryAccess, sort]) =>
      stockFetcher(url, cik, secondaryAccess, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (primaryData) {
      const type = "primary";
      const stocks = primaryData.stocks;
      const count = primaryData.count;
      dispatch(setFilingCount({ type, count }));
      dispatch(setFilingStocks({ type, stocks }));
    }
  }, [primaryData]);
  useEffect(() => {
    if (secondaryData) {
      const type = "secondary";
      const stocks = secondaryData.stocks;
      const count = secondaryData.count;
      dispatch(setFilingCount({ type, count }));
      dispatch(setFilingStocks({ type, stocks }));
    }
  }, [secondaryData]);

  const primaryStocks = primary?.stocks;
  const secondaryStocks = secondary?.stocks;

  if (error) return <Error statusCode={404} />;
  if (!primaryStocks?.length && !secondaryStocks?.length)
    return <Unavailable type="stocks" cik={cik} />;

  const primaryItems = primary.stocks.map((s) => {
    return { ...s, id: s.cusip };
  });
  const secondaryItems = secondary.stocks.map((s) => {
    return { ...s, id: s.cusip };
  });

  return (
    <div className={styles["explorer-container"]}>
      <Timeline />
      <div className={styles["explorer-tables"]}>
        <div className={styles["table-container"]}>
          <Table items={primaryItems} headers={primary.headers} />
        </div>
      </div>
    </div>
  );
};

export default Explorer;
