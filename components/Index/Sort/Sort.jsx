import { useState } from "react";
import styles from "./Sort.module.css";

import Filter from "./Filter/Filter";
import Gain from "./Gain/Gain";
import Record from "./Record/Record";
import Tip from "@/components/Tip/Tip";

import { fontLight } from "@fonts";
import FunnelIcon from "@/public/static/filter.svg";

const Sort = () => {
  const [expand, setExpand] = useState(false);

  return (
    <div
      className={[
        styles["sort-container"],
        expand ? styles["sort-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["sort-header"]} onClick={() => setExpand(!expand)}>
        {/* <span className={[styles["filter-text"], font.className].join(" ")}>
            FILTER
          </span> */}
        <FunnelIcon className={styles["sort-icon"]} />
        <span
          className={[
            styles["sort-tip"],
            expand ? styles["tip-expanded"] : "",
            fontLight.className,
          ].join(" ")}
        >
          Click the filter icon on the left to find additional analysis,
          manipulate the table, and download any data you see.
        </span>
      </div>
      <div className={styles["sort-body"]}>
        <Filter />
        <Gain />
        <div className={styles["sort-records"]}>
          <div className={styles["sort-downloads"]}>
            <Record variant="json" />
            <Record variant="csv" />
          </div>
          <Tip text="Downloads for bulk data." />
        </div>
      </div>
    </div>
  );
};

export default Sort;
