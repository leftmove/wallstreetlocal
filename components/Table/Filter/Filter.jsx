import { useState } from "react";
import styles from "../Table.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useDispatch, useSelector } from "react-redux";
import { selectHeaders, activateHeader } from "@/redux/features/stockSlice";

import FilterSVG from "./filter.svg";

const Filter = () => {
  const headers = useSelector(selectHeaders);
  const dispatch = useDispatch();

  const [expand, setExpand] = useState(false);

  return (
    <div
      className={[
        styles["filter-container"],
        expand ? styles["filter-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["filter-header"]}>
        {/* <span className={[styles["filter-text"], inter.className].join(" ")}>
          FILTER
        </span> */}
        <FilterSVG
          className={styles["filter-icon"]}
          onClick={() => setExpand(!expand)}
        />
      </div>
      <div className={styles["filter-body"]}>
        {headers.map((h) => (
          <button
            key={h.display}
            className={[
              styles["filter-item"],
              h.active ? styles["filter-clicked"] : "",
            ].join(" ")}
            onClick={() => dispatch(activateHeader(h.accessor))}
          >
            <span
              className={[inter.className, styles["filter-text"]].join(" ")}
            >
              {h.display}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filter;
