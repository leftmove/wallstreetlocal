import styles from "./Tabs.module.css";

import { font, fontLight } from "@fonts";

const Tabs = (props) => {
  const tab = props.tab;

  return (
    <div className={styles["tabs"]}>
      <div className={styles["tab-container"]}>
        <div
          className={[
            styles["tab"],
            tab === "recent" ? styles["tab-clicked"] : "",
            font.className,
          ].join(" ")}
          onClick={() => props.setRecent()}
        >
          Recent
        </div>
        <span className={[styles["tab-tip"], fontLight.className].join(" ")}>
          (Stocks)
        </span>
      </div>
      <div className={styles["tab-container"]}>
        <div
          className={[
            styles["tab"],
            tab === "historical" ? styles["tab-clicked"] : "",
            font.className,
          ].join(" ")}
          onClick={() => props.setHistorical()}
        >
          Historical
        </div>
        <span className={[styles["tab-tip"], fontLight.className].join(" ")}>
          (Filings)
        </span>
      </div>
    </div>
  );
};

export default Tabs;
