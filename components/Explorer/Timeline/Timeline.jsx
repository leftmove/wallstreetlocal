import styles from "./Timeline.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectPrimary,
  selectSecondary,
  selectTimeline,
  setOpen,
  filingIncrement,
  filingDecrement,
} from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";
import SwitchIcon from "@/public/static/switch.svg";

import Select from "./Select/Select";
import Tip from "@/components/Tip/Tip";

const Timeline = () => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);
  const primary = useSelector(selectPrimary);
  const secondary = useSelector(selectSecondary);

  const primaryAccess = primary.access;
  const secondaryAccess = secondary.access;
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
            <span>{primaryAccess}</span>
            <SwitchIcon className={styles["switch-icon"]} />
            <span>{secondaryAccess}</span>
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
