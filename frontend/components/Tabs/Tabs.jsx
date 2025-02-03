import styles from "./Tabs.module.css";

import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";
import { selectTab, setTab } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";
import { useEffect } from "react";

const Tab = (props) => {
  const id = props.id;
  const tab = props.tab;
  const index = props.index + 1;
  const handleTab = props.handleTab;

  const length = props.length;
  const hint = props.hint || null;

  return (
    <div className={styles["tab-container"]}>
      <div
        className={[
          styles["tab"],
          index === 1 ? styles["first-tab"] : "",
          index === length ? styles["last-tab"] : "",
          tab === id ? styles["tab-clicked"] : "",
          font.className,
        ].join(" ")}
        onClick={() => handleTab(id)}
      >
        {props.title}
      </div>
      {hint ? (
        <span className={[styles["tab-tip"], fontLight.className].join(" ")}>
          ({hint})
        </span>
      ) : null}
    </div>
  );
};

const defaultTabs = [
  { title: "Stocks", hint: "Table", id: "stocks" },
  // { titl e: "Charts", hint: "Graphs", id: "charts" },
  { title: "Filings", hint: "Comparisons", id: "filings" },
];

const Tabs = (props) => {
  const tab = useSelector(selectTab);
  const dispatch = useDispatch();
  const tabs = props.tabs || defaultTabs;

  const router = useRouter();
  const handleTab = (value) => {
    router.query.tab = value;
    router.push(router);
    dispatch(setTab(value));
  };

  useEffect(() => {
    if (tabs.find((t) => t.id === tab) === undefined) {
      dispatch(setTab(tabs[0].id));
    } else {
      return;
    }
  }, []);

  return (
    <div className={styles["tabs"]}>
      {tabs.map((t, index) => (
        <Tab
          id={t.id}
          tab={tab}
          handleTab={handleTab}
          length={tabs.length}
          key={t.id}
          hint={t.hint}
          index={index}
          title={t.title}
        />
      ))}
    </div>
  );
};

export default Tabs;
