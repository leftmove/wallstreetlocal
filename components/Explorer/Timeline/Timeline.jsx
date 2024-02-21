import styles from "./Timeline.module.css";

import { useDispatch, useSelector } from "react-redux";
import { selectPrimary, selectTimeline, setOpen } from "@/redux/filerSlice";

import { font } from "@fonts";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";

import Select from "./Select/Select";

const Timeline = () => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);
  const primary = useSelector(selectPrimary);

  const access = primary.access;
  const open = timeline.open;

  return (
    <div
      className={[
        styles["timeline-container"],
        open ? styles["timeline-expanded"] : "",
      ].join(" ")}
    >
      <div className={styles["timeline"]}>
        <button className={styles["timeline-button"]}>
          <LeftIcon className={styles["timeline-icon"]} />
        </button>
        <div
          className={[
            styles["timeline-select"],
            open ? styles["timeline-expanded"] : "",
            font.className,
          ].join(" ")}
          onClick={() => dispatch(setOpen(!open))}
        >
          <span>{access}</span>
        </div>
        <button className={styles["timeline-button"]}>
          <RightIcon className={styles["timeline-icon"]} />
        </button>
      </div>
      <div className={styles["timeline-selects"]}>
        <Select type="primary" />
        <Select type="secondary" />
      </div>
    </div>
  );
};

export default Timeline;
