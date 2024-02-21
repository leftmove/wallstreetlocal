import styles from "./Timeline.module.css";

import { useDispatch, useSelector } from "react-redux";
import { selectTimeline, setOpen } from "@/redux/filerSlice";

import { font } from "@fonts";

const Timeline = () => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);

  const access = timeline.access;
  const open = timeline.open;
  return (
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
  );
};

export default Timeline;
