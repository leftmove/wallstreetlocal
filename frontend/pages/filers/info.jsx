import styles from "@/styles/Filer.module.css";
import { useState, useEffect } from "react";

import Head from "next/head";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import useSWR from "swr";
import axios from "axios";

import { useDispatch } from "react-redux";
import { setCik } from "@/redux/filerSlice";

import Expand from "@/components/Expand/Expand";
import Table from "@/components/Table/Table";
import Reload from "@/components/Progress/Reload/Reload";

const fetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const server = process.env.NEXT_PUBLIC_SERVER;
const InfoPage = (props) => {
  const cik = props.cik;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCik(cik));
  }, [cik]);

  const [expand, setExpand] = useState(false);
  const { data, isLoading: loading } = useSWR(
    cik ? [server + "/filers/info", cik] : null,
    ([url, cik]) => fetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );
  const info = data?.filer || null;

  return (
    <>
      <Head>
        <title>Filers - {info?.name || "Loading"}</title>
      </Head>
      <div className={styles["header"]}>
        <span className={[styles["main-header"], inter.className].join(" ")}>
          {info?.name}
        </span>
        <div
          className={[
            styles["sub-header"],
            expand ? styles["sub-header-expanded"] : "",
          ].join(" ")}
        >
          <div className={styles["secondary-header"]}>
            <span
              className={[
                styles["secondary-header-desc"],
                inter.className,
              ].join(" ")}
            >
              {info?.cik} {info?.tickers ? `(${info?.tickers.join(", ")})` : ""}
            </span>
            <Expand onClick={() => setExpand(!expand)} expandState={expand} />
          </div>
          <span className={[styles["header-desc"], inter.className].join(" ")}>
            {info?.data?.description}
          </span>
        </div>

        {/* <span className={[styles["sub-desc"], inter.className].join(" ")}>
        {info.data["Description"]}
      </span> */}
      </div>
      <Table />
      <div className={styles["header"]}>
        {/* <span className={[styles["main-header"], inter.className].join(" ")}>
          Info
        </span> */}
      </div>
    </>
  );
};

export default InfoPage;
