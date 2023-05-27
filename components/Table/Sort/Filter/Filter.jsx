import styles from "./Filter.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useDispatch, useSelector } from "react-redux";
import {
  selectHeaders,
  selectActive,
  selectSold,
  sortActive,
  sortSold,
  activateHeader,
} from "@/redux/filerSlice";

const Filter = () => {
  const headers = useSelector(selectHeaders);
  const active = useSelector(selectActive);
  const sold = useSelector(selectSold);
  const dispatch = useDispatch();

  return (
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
          <span className={[inter.className, styles["filter-text"]].join(" ")}>
            {h.display}
          </span>
        </button>
      ))}
      <button
        className={[
          styles["filter-item"],
          active ? styles["filter-clicked"] : "",
        ].join(" ")}
        onClick={() => dispatch(sortActive())}
      >
        <span className={[inter.className, styles["filter-text"]].join(" ")}>
          Active
        </span>
      </button>
      <button
        className={[
          styles["filter-item"],
          sold ? styles["filter-clicked"] : "",
        ].join(" ")}
        onClick={() => dispatch(sortSold())}
      >
        <span className={[inter.className, styles["filter-text"]].join(" ")}>
          Sold
        </span>
      </button>
    </div>
  );
};

export default Filter;
