import styles from "./Tabs.module.css";

import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";
import { selectTab, setTab } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

import React from "react";

interface TabProps {
  id: string;
  tab: string;
  index: number;
  handleTab: (id: string) => void;
  length: number;
  hint?: string | null;
  title: string;
}

const Tab: React.FC<TabProps> = (props) => {
  const { id, tab, index, handleTab, length, hint, title } = props;
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
        {title}
      </div>
      {hint ? (
        <span className={[styles["tab-tip"], fontLight.className].join(" ")}>
          ({hint})
        </span>
      ) : null}
    </div>
  );
};

interface TabData {
  title: string;
  hint: string;
  id: string;
}

const tabs: TabData[] = [
  { title: "Stocks", hint: "Table", id: "stocks" },
  // { title: "Charts", hint: "Graphs", id: "charts" },
  { title: "Filings", hint: "Comparisons", id: "filings" },
];

const Tabs: React.FC = () => {
  const tab = useSelector(selectTab);
  const dispatch = useDispatch();

  const router = useRouter();
  const handleTab = (value: string) => {
    router.query.tab = value;
    router.push(router);
    dispatch(setTab(value));
  };

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