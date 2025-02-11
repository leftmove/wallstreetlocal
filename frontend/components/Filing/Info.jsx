"use server";

import styles from "styles/Filer.module.css";

import Navigation from "components/Navigation/Filer/Navigation";
import Tabs from "components/Tabs/Tabs";
import Header from "components/Header/Header";
import Holdings from "components/Explorer/Filing/Explorer";
import Changes from "components/Explorer/Changes/Explorer";

const Info = (props) => {
  const cik = props.cik || null;
  const an = props.an || null;

  const tab = props.tab || "recent";
  const tabs = [
    { title: "Changes", hint: "Bought and Sold", id: "changes" },
    { title: "Historical", hint: "Comparisons", id: "filings" },
  ];

  return (
    <>
      <Navigation page="holdings" cik={cik} an={an} />
      <Header cik={cik} tab={tab} />
      <Tabs tabs={tabs} />
      <div className={styles.data}>
        {tab === "filings" ? <Holdings cik={cik} an={an} /> : null}
        {tab === "changes" ? <Changes cik={cik} an={an} /> : null}
      </div>
    </>
  );
};

export default Info;
