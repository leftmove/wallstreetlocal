import styles from "./Timeline.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { selectTimeline, setOpen } from "@/redux/filerSlice";

import { font, fontLight } from "fonts";
import { cn } from "components/ui/utils";

import Analysis from "components/Analysis/Analysis";
import Tip from "components/Tip/Tip";
import Difference from "./Difference/Difference";
import Select from "./Select/Select";

const Timeline = (props) => {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);

  const open = timeline.open;
  const [description, setDescription] = useState({
    title: "",
    text: "",
  });

  const orders = props.orders || ["primary", "secondary"];
  const firstOrder = orders.at(0);
  const secondOrder = orders.at(1);

  return (
    <Analysis>
      <div className={styles["timeline-description"]}>
        {description.title && description.text && (
          <>
            <span
              className={[styles["timeline-display"], font.className].join(" ")}
            >
              {description.title}
            </span>
            <span
              className={[styles["timeline-text"], fontLight.className].join(
                " "
              )}
            >
              {description.text}
            </span>
          </>
        )}
      </div>
      <div className={styles["timeline-selects"]}>
        <div className="w-full h-full">
          <h6 className="w-full text-xs font-medium text-center opacity-50 font-switzer ">
            (Left Comparison)
          </h6>
          <Select
            type={firstOrder}
            setDescription={(desc) => setDescription(desc)}
          />
        </div>
        <div className="w-full h-full mt-10">
          <h6 className="w-full text-xs font-medium text-center opacity-50 font-switzer ">
            (Right Comparison)
          </h6>
          <Select
            type={secondOrder}
            setDescription={(desc) => setDescription(desc)}
          />
        </div>
      </div>
    </Analysis>
  );
};

export default Timeline;
