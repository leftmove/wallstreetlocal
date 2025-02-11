import styles from "./Header.module.css";
import { useState, useEffect } from "react";

import useSWR from "swr";
import axios from "axios";

import Head from "next/head";

import { useDispatch } from "react-redux";
import { setCik, setTab, setAccess } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

import Expand from "components/Expand/Expand";
import Source from "components/Source/Source";
import Share from "components/Share/Share";
import Building from "components/Progress/Building/Building";
import { convertTitle } from "components/Filer/Info";

const server = process.env.NEXT_PUBLIC_SERVER;
const filerFetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.error(e));
const filingFetcher = (url, cik, an) =>
  axios
    .get(url, { params: { cik: cik, access_number: an } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const Header = (props) => {
  const cik = props.cik;
  const an = props.an;

  const variant = props.variant;
  const tab = props.tab;

  const dispatch = useDispatch();
  const [expand, setExpand] = useState(false);

  const { data: filerData } = useSWR(
    cik ? [server + "/filers/info", cik] : null,
    ([url, cik]) => filerFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );
  const { data: filingData } = useSWR(
    cik && an ? [server + "/filing/info", cik, an] : null,
    ([url, cik, an]) => filingFetcher(url, cik, an),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );

  const filerInfo = filerData?.filer || null;
  const name = filerInfo?.name ? convertTitle(filerInfo.name) : "";
  const description = filerInfo?.financials?.description;
  const title = `${name || cik} - Filers`;

  const filingInfo = filingData?.filing || null;
  const date = new Date(filingInfo?.report_date * 1000);

  useEffect(() => {
    const access = filerInfo?.filings?.at(0);
    const financials = filerInfo?.financials;

    dispatch(setCik(cik ? cik : ""));
    dispatch(setAccess(access ? access : ""));
    dispatch(setTab(tab));
  }, [cik]);

  return (
    <>
      <Head>
        <meta
          name="description"
          content={`${name} 13F Filing Investment Portfolio.\n${description}`}
        />
        <meta
          name="keywords"
          content={`13F, Filing, ${name}, Stocks, Investment, Money Manager, Company`}
        ></meta>
        <title>{title}</title>
      </Head>
      <div className={styles["header"]}>
        <div className={styles["main-header"]}>
          <span
            className={[styles["main-header-text"], font.className].join(" ")}
          >
            {name}
          </span>
          {variant === "filing" && (
            <span
              className={[styles["side-header"], fontLight.className].join(" ")}
            >
              {date.toLocaleDateString()}
            </span>
          )}
          {filerInfo?.status > 0 ? <Building cik={cik} /> : null}
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
                {filerInfo?.cik}{" "}
                {filerInfo?.tickers.length
                  ? `(${filerInfo?.tickers.join(", ")})`
                  : ""}
              </span>
            </div>
            <div className={styles["secondary-header"]}>
              {filerInfo?.financials?.description ? (
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
              <Share cik={cik} an={an} marginLeft={5} color="dark" />
            </div>
          </div>
          <span className={[styles["header-desc"], font.className].join(" ")}>
            {filerInfo?.financials?.description}
          </span>
        </div>
      </div>
    </>
  );
};

export default Header;
