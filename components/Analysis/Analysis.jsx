import styles from "./Analysis.module.css";
import { useState } from "react";

import FolderIcon from "@/public/static/folder.svg";
import FilterIcon from "@/public/static/filter.svg";

import { fontLight } from "@fonts";

const Analysis = ({ text = "Analysis", icon = "folder", children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={[
        styles["analysis-container"],
        open ? styles["analysis-expanded"] : "",
      ].join(" ")}
    >
      <div
        className={[
          styles["analysis-button"],
          open ? styles["analysis-hidden"] : "",
        ].join(" ")}
        onClick={() => setOpen(!open)}
      >
        {icon === "folder" ? (
          <FolderIcon className={styles["analysis-icon"]} />
        ) : null}
        {icon === "filter" ? (
          <FilterIcon className={styles["analysis-icon"]} />
        ) : null}
        <div
          className={[
            styles["analysis-dummy"],
            open ? styles["dummy-expand"] : styles["dummy-contract"],
          ].join(" ")}
        ></div>
        <span
          className={[styles["analysis-tip"], fontLight.className].join(" ")}
        >
          {text}
        </span>
      </div>
      <div className={styles["analysis-children"]}>{children}</div>
    </div>
  );
};

export default Analysis;
