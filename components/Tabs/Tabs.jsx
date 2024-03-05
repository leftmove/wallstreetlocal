import styles from "./Tabs.module.css";

import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";
import { selectTab, setTab } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

const Tabs = () => {
  const tab = useSelector(selectTab);
  const dispatch = useDispatch();

  const router = useRouter();
  const handleTab = (value) => {
    router.query.tab = value;
    router.push(router);
    dispatch(setTab(value));
  };
  return (
    <div className={styles["tabs"]}>
      <div className={styles["tab-container"]}>
        <div
          className={[
            styles["tab"],
            tab === "recent" ? styles["tab-clicked"] : "",
            font.className,
          ].join(" ")}
          onClick={() => handleTab("recent")}
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
          onClick={() => handleTab("historical")}
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
