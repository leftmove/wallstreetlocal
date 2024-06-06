"use server";

import styles from "@/styles/Filer.module.css";

import Head from "next/head";

import Tabs from "components/Tabs/Tabs";
import Index from "components/Index/Index";
import Charts from "components/Charts/Charts";
import Explorer from "components/Explorer/Explorer";
import Header from "components/Header/Header";

const convertTitle = (d: string | null): string | null => {
    if (d) {
        d = d.replace(
            /(^\w|\s\w)(\S*)/g,
            (_, m1, m2) => {
                if (/[a-z][A-Z]|[A-Z][a-z]/.test(m1 + m2)) {
                    return m1 + m2; // Return the original word
                } else {
                    return m1.toUpperCase() + m2.toLowerCase(); // Convert to title case
                }
            }
        );
        ["LLC", "LP", "L.P.", "LLP", "N.A."].forEach((word) => {
            d = d.replace(
                word.at(0).toUpperCase() + word.toLowerCase().slice(1),
                word
            );
        });
    }
    return d;
};

interface InfoProps {
  cik?: string | null;
  tab?: TabType;
}

enum TabType {
  RECENT = "recent",
  FILINGS = "filings",
  CHARTS = "charts",
  STOCKS = "stocks"
}

const Info: React.FC<InfoProps> = (props) => {
  const cik = props.cik || null;
  const tab = props.tab || TabType.RECENT;
  const titleText = `Filers - ${cik}`;

  return (
    <>
      <Head>
        <title>{titleText}</title>
      </Head>
      <Header cik={cik} tab={tab} />
      <Tabs />
      <div className={styles.data}>
        {tab === TabType.FILINGS ? <Explorer /> : null}
        {/* {tab === TabType.CHARTS ? <Charts /> : null} */}
        {tab === TabType.STOCKS ? <Index /> : null}
      </div>
    </>
  );
};

export { convertTitle };
export default Info;