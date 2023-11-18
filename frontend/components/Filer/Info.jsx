import styles from "@/styles/Filer.module.css";
import { useState, useEffect } from "react";

import Head from "next/head";
import Error from "next/error";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import useSWR from "swr";
import axios from "axios";

import { useDispatch } from "react-redux";
import { setCik } from "@/redux/filerSlice";

import Expand from "@/components/Expand/Expand";
import Table from "@/components/Table/Table";
import Building from "@/components/Progress/Building/Building";
import SourceIcon from "@/public/static/contact.svg";

const fetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const server = process.env.NEXT_PUBLIC_SERVER;
const Info = (props) => {
  const cik = props.cik || null;
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
        <div className={styles["main-header"]}>
          <span
            className={[styles["main-header-text"], inter.className].join(" ")}
          >
            {info?.name}
          </span>
          {info?.status > 0 ? <Building cik={cik} /> : null}
        </div>
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
            <button
              className={styles["source-button"]}
              onClick={() =>
                window.open(
                  "https://www.sec.gov/cgi-bin/browse-edgar?" +
                    new URLSearchParams({ CIK: cik.padStart(10, 0) }),
                  "_blank"
                )
              }
            >
              <SourceIcon />
            </button>
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

export default Info;
