"use server";

import styles from "@/styles/Filer.module.css";

import Explorer from "components/Explorer/Explorer";
import Header from "components/Header/Header";
import Filing from "components/Filing/Filing";
import Index from "components/Index/Filing/Holdings/Index";
import Analysis from "components/Analysis/Analysis";
import Sort from "components/Index/Sort/Sort";

const Info = (props) => {
  const cik = props.cik || null;
  const an = props.an || null;

  const tab = props.tab || "recent";

  return (
    <>
      <Filing cik={cik} an={an} />
      <Header cik={cik} an={an} tab={tab} variant="filing" />
      <div className={styles.data}>
        {tab === "filings" ? <Explorer /> : null}
        {/* {tab === "charts" ? <Charts /> : null} */}

        {tab === "stocks" ? (
          <>
            <Analysis icon="filter">
              <Sort />
            </Analysis>
            <Index cik={cik} an={an} />
          </>
        ) : null}
      </div>
    </>
  );
};

export default Info;
