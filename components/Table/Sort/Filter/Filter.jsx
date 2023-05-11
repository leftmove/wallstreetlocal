import styles from "./Filter.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useDispatch, useSelector } from "react-redux";
import { selectHeaders, activateHeader } from "@/redux/features/stockSlice";

const Filter = () => {
  const headers = useSelector(selectHeaders);
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
    </div>
  );
};

export default Filter;
