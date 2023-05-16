import styles from "./Gain.module.css";

import { selectDates, newDate } from "@/redux/dateSlice";
import { useDispatch, useSelector } from "react-redux";

import Select from "./Select/Select";
import PlusSVG from "./plus.svg";

const Gain = () => {
  const dates = useSelector(selectDates);
  const dispatch = useDispatch();

  return (
    <div className={styles["gains-container"]}>
      <div className={styles["header"]}>
        {/* <span className={[styles["header-title"], inter.className].join(" ")}>
          Gains
        </span>
        <span
          className={[styles["header-description"], inter.className].join(" ")}
        >
          Compare gains from different time periods. Select a time period below
          to view the buy price, recent price, and percent gain.
        </span> */}
      </div>
      <div className={styles["dates"]}>
        {dates.map((date, index) => (
          <Select key={index} date={date} />
        ))}
        <button
          className={styles["add-date"]}
          onClick={() => dispatch(newDate())}
        >
          <PlusSVG />
        </button>
      </div>
    </div>
  );
};

export default Gain;
