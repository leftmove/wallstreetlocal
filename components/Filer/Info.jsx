import styles from "@/styles/Filer.module.css";
import { useState, useEffect } from "react";

import Head from "next/head";

import { font } from "@fonts";

import useSWR from "swr";
import axios from "axios";

import { useDispatch } from "react-redux";
import { setCik } from "@/redux/filerSlice";

import Table from "@/components/Table/Table";
import Subheader from "@/components/Subheader/Subheader";
import Building from "@/components/Progress/Building/Building";

const fetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const convertTitle = (d) => {
  if (d) {
    d = d.replace(
      /(^\w|\s\w)(\S*)/g,
      (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
    );
    ["LLC", "LP", "L.P.", "LLP"].forEach((word) => {
      d = d.replace(
        word.at(0).toUpperCase() + word.toLowerCase().slice(1),
        word
      );
    });
  }
  return d;
};

const server = process.env.NEXT_PUBLIC_SERVER;
const Info = (props) => {
  const cik = props.cik || null;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCik(cik));
  }, [cik]);

  const [expand, setExpand] = useState(false);
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
  const info = data?.filer || null;
  const name = convertTitle(info?.name);

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
            {name}
          </span>
          {info?.status > 0 ? <Building cik={cik} /> : null}
        </div>

        {/* <span className={[styles["sub-desc"], font.className].join(" ")}>
        {info.data["Description"]}
      </span> */}
        <Subheader info={info} />
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

export { convertTitle };
export default Info;
