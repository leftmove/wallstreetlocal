import styles from "./Subheader.module.css";
import { useState } from "react";

import { font } from "@fonts";

import Expand from "@/components/Expand/Expand";
import Source from "@/components/Source/Source";

const Subheader = (props) => {
  const info = props.info;
  const cik = info?.cik;

  const [expand, setExpand] = useState(false);

  return (
    <div
      className={[
        styles["sub-header"],
        expand ? styles["sub-header-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["secondary-headers"]}>
        <div className={styles["secondary-header"]}>
          <span
            className={[styles["secondary-header-desc"], font.className].join(
              " "
            )}
          >
            {info?.cik}{" "}
            {info?.tickers.length ? `(${info?.tickers.join(", ")})` : ""}
          </span>
        </div>
        <div className={styles["secondary-header"]}>
          {info?.data.description ? (
            <Expand onClick={() => setExpand(!expand)} expandState={expand} />
          ) : null}
          <Source cik={cik} />
        </div>
      </div>
      <span className={[styles["header-desc"], font.className].join(" ")}>
        {info?.data?.description}
      </span>
    </div>
  );
};

export default Subheader;
