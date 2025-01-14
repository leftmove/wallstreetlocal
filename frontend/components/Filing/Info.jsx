"use server";

import styles from "@/styles/Filer.module.css";

import Head from "next/head";

import Tabs from "components/Tabs/Tabs";
import Index from "components/Index/Index";
import Charts from "components/Charts/Charts";
import Explorer from "components/Explorer/Explorer";
import Header from "components/Header/Header";
import { convertTitle } from "components/Filer/Info";

const Info = (props) => {
  const cik = props.cik || null;
  const tab = props.tab || "recent";
  const title = `Filers - ${cik}`; // Fallback for header title

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Header cik={cik} tab={tab} />
      <Tabs />
      <div className={styles.data}>
        {tab === "filings" ? <Explorer /> : null}
        {/* {tab === "charts" ? <Charts /> : null} */}
        {tab === "stocks" ? <Index /> : null}
      </div>
    </>
  );
};

export default Info;
