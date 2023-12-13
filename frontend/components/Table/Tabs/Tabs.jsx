import styles from "./Tabs.module.css";
import { useState } from "react";

import { font } from "@fonts";

const Tabs = (props) => {
  const tab = props.tab;

  return (
    <div className={styles["tabs"]}>
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
    </div>
  );
};

export default Tabs;
