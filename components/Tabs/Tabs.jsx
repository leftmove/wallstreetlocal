import styles from "./Tabs.module.css";

import { useDispatch, useSelector } from "react-redux";
import { selectTab, setTab } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

const Tabs = () => {
  const dispatch = useDispatch();
  const tab = useSelector(selectTab);
  return (
    <div className={styles["tabs"]}>
      <div className={styles["tab-container"]}>
        <div
          className={[
            styles["tab"],
            tab === "recent" ? styles["tab-clicked"] : "",
            font.className,
          ].join(" ")}
          onClick={() => dispatch(setTab("recent"))}
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
          onClick={() => dispatch(setTab("historical"))}
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
