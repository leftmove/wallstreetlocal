"use server";

import styles from "@/styles/Filer.module.css";

import Tabs from "components/Tabs/Tabs";
import Header from "components/Header/Header";
import Explorer from "@/components/Explorer/Filing/Explorer";

const Info = (props) => {
  const cik = props.cik || null;
  const an = props.an || null;

  const tab = props.tab || "recent";
  const tabs = [
    { title: "Changes", hint: "Bought and Sold", id: "changes" },
    { title: "Filings", hint: "Stocks", id: "filings" },
  ];

  return (
    <>
      <Header cik={cik} tab={tab} />
      <Tabs tabs={tabs} />
      <div className={styles.data}>
        {/* {tab === "changes" ? <Explorer /> : null} */}
        {tab === "changes" ? <Explorer /> : null}
      </div>
    </>
  );
};

export default Info;
