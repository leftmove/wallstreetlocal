import styles from "./Timeline.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { font, fontLight } from "@fonts";

import Analysis from "components/Analysis/Analysis";
import Tip from "components/Tip/Tip";
import Difference from "./Difference/Difference";
import Select from "./Select/Select";
import { selectTimeline } from "@/redux/timelineSlice";

const Timeline = () => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);

  const open = timeline.open;
  const [description, setDescription] = useState({
    title: "",
    text: "",
  });

  return (
    <Analysis>
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
        text="This UI is new and therefore looks somewhat ugly. If you have any ideas, suggestions on GitHub are appreciated."
        top={30}
      />
    </Analysis>
  );
};

export default Timeline;
