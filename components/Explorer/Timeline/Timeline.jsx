import styles from "./Timeline.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectPrimary,
  selectSecondary,
  selectTimeline,
  setOpen,
} from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";
import SwitchIcon from "@/public/static/switch.svg";
import FolderIcon from "@/public/static/folder.svg";

import Tip from "@/components/Tip/Tip";
import Difference from "./Difference/Difference";
import Select from "./Select/Select";

const Timeline = () => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);
  const primary = useSelector(selectPrimary);
  const secondary = useSelector(selectSecondary);

  const open = timeline.open;
  const [description, setDescription] = useState({
    title: "",
    text: "",
  });

  return (
    <div
      className={[
        styles["timeline-container"],
        open ? styles["timeline-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["timeline"]}>
        {/* <button
          className={styles["timeline-button"]}
          onClick={() => dispatch(filingDecrement())}
        >
          <LeftIcon className={styles["timeline-icon"]} />
        </button> */}
        <div
          className={[
            styles["timeline-select"],
            open ? styles["timeline-expanded"] : "",
            font.className,
          ].join(" ")}
          onClick={() => dispatch(setOpen(!open))}
        >
          <div className={styles["timeline-info"]}>
            <FolderIcon className={styles["sort-icon"]} />
            <span
              className={[
                styles["sort-tip"],
                open ? styles["sort-hidden"] : "",
                fontLight.className,
              ].join(" ")}
            >
              Click the folder icon on the left to find additional filings,
              manipulate the table, and download any data you see.
            </span>
          </div>
        </div>
        {/* <button
          className={styles["timeline-button"]}
          onClick={() => dispatch(filingIncrement())}
        >
          <RightIcon className={styles["timeline-icon"]} />
        </button> */}
      </div>
      <div className={styles["timeline-description"]}>
        <span
          className={[styles["timeline-display"], font.className].join(" ")}
        >
          {description.title}
        </span>
        <span
          className={[styles["timeline-text"], fontLight.className].join(" ")}
        >
          {description.text}
        </span>
      </div>

      <div className={styles["timeline-selects"]}>
        <Select
          type="primary"
          setDescription={(desc) => setDescription(desc)}
        />
        {/* <Difference setDescription={(desc) => setDescription(desc)} /> */}
        <Select
          type="secondary"
          setDescription={(desc) => setDescription(desc)}
        />
      </div>
      <Tip
        text="This UI is new and therefore looks somewhat ugly. If you have any ideas, suggestions on GitHub are appreciated. (This goes for any other CSS on the website as well.)"
        top={30}
      />
    </div>
  );
};

export default Timeline;
