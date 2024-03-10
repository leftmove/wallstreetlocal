import styles from "./Header.module.css";
import { useState, useEffect } from "react";

import useSWR from "swr";
import axios from "axios";

import Head from "next/head";

import { useDispatch } from "react-redux";
import { setCik, setTab } from "@/redux/filerSlice";

import { font } from "@fonts";

import Expand from "@/components/Expand/Expand";
import Source from "@/components/Source/Source";
import Building from "@/components/Progress/Building/Building";
import { convertTitle } from "@/components/Filer/Info";

const server = process.env.NEXT_PUBLIC_SERVER;
const fetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const Header = (props) => {
  const cik = props.cik;
  const tab = props.tab;
  const dispatch = useDispatch();

  const { data } = useSWR(
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
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    dispatch(setCik(cik));
    dispatch(setTab(tab));
  }, [cik]);

  const info = data?.filer || null;
  const name = info?.name ? convertTitle(info.name) : "";

  return (
    <>
      <Head>
        <meta
          name="description"
          content={`wallstreetlocal Filer - ${name}`}
          key="desc"
        />
      </Head>
      <div className={styles["header"]}>
        <div className={styles["main-header"]}>
          <span
            className={[styles["main-header-text"], font.className].join(" ")}
          >
            {name}
          </span>
          {info?.status > 0 ? <Building cik={cik} /> : null}
        </div>
        <div
          className={[
            styles["sub-header"],
            expand ? styles["sub-header-expanded"] : "",
          ].join(" ")}
        >
          <div className={styles["secondary-headers"]}>
            <div className={styles["secondary-header"]}>
              <span
                className={[
                  styles["secondary-header-desc"],
                  font.className,
                ].join(" ")}
              >
                {info?.cik}{" "}
                {info?.tickers.length ? `(${info?.tickers.join(", ")})` : ""}
              </span>
            </div>
            <div className={styles["secondary-header"]}>
              {info?.financials?.description ? (
                <Expand
                  onClick={() => setExpand(!expand)}
                  expandState={expand}
                />
              ) : null}
              <Source
                link={
                  "https://www.sec.gov/cgi-bin/browse-edgar?" +
                  new URLSearchParams({ CIK: cik.padStart(10, 0) })
                }
                marginLeft={5}
              />
            </div>
          </div>
          <span className={[styles["header-desc"], font.className].join(" ")}>
            {info?.financials?.description}
          </span>
        </div>
      </div>
    </>
  );
};

export default Header;
