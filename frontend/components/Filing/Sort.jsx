import styles from "components/Explorer/Timeline/Timeline.module.css";
import { useState } from "react";

import { font, fontLight } from "fonts";

import Analysis from "components/Analysis/Analysis";
import Select from "components/Explorer/Timeline/Select/Select";

const Sort = () => {
  const [description, setDescription] = useState("");
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
          <Select type="main" setDescription={(desc) => setDescription(desc)} />
        </div>
      </div>
    </Analysis>
  );
};

export default Sort;
