import styles from "@/styles/Filer.module.css";
import { useState, useEffect } from "react";

import Head from "next/head";

import { font } from "@fonts";

import useSWR from "swr";
import axios from "axios";

import { useDispatch } from "react-redux";
import { setCik } from "@/redux/filerSlice";

import Expand from "@/components/Expand/Expand";
import Table from "@/components/Table/Table";
import Source from "@/components/Source/Source";
import Building from "@/components/Progress/Building/Building";
import Reccomended from "@/components/Recommended/Recommended";

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
            className={[styles["main-header-text"], font.className].join(" ")}
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
              className={[styles["secondary-header-desc"], font.className].join(
                " "
              )}
            >
              {info?.cik}{" "}
              {info?.tickers.length ? `(${info?.tickers.join(", ")})` : ""}
            </span>
            {info?.data.description ? (
              <Expand onClick={() => setExpand(!expand)} expandState={expand} />
            ) : null}
            <Source cik={cik} />
          </div>
          <span className={[styles["header-desc"], font.className].join(" ")}>
            {info?.data?.description}
          </span>
        </div>
        {/* <span className={[styles["sub-desc"], font.className].join(" ")}>
        {info.data["Description"]}
      </span> */}
      </div>
      <Table />
      <div className={styles["header"]}>
        {/* <span className={[styles["main-header"], font.className].join(" ")}>
          Info
        </span> */}
      </div>
    </>
  );
};

export default Info;
