import { useState } from "react";
import styles from "./Sort.module.css";

import Filter from "./Filter/Filter";
import Gain from "./Gain/Gain";
import Record from "./Record/Record";
import SortIcon from "@/public/static/filter.svg";

const Sort = () => {
  const [expand, setExpand] = useState(false);

  return (
    <div
      className={[
        styles["sort-container"],
        expand ? styles["sort-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["sort-header"]}>
        {/* <span className={[styles["filter-text"], inter.className].join(" ")}>
            FILTER
          </span> */}
        <SortIcon
          className={styles["sort-icon"]}
          onClick={() => setExpand(!expand)}
        />
      </div>
      <div className={styles["sort-body"]}>
        <Filter />
        <Gain />
        <Record />
      </div>
    </div>
  );
};

export default Sort;
