import styles from "./Gain.module.css";
import { useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Date from "./Date/Date";
import PlusSVG from "./plus.svg";

const Gain = () => {
  const [dates, setDates] = useState([{}]);
  const addDate = (date) => setDates([...dates, date]);
  const removeDate = (index) => setDates(dates.splice(index, 1));

  return (
    <div className={styles["gains-container"]}>
      <div className={styles["header"]}>
        <span className={[styles["header-title"], inter.className].join(" ")}>
          Gains
        </span>
        <span
          className={[styles["header-description"], inter.className].join(" ")}
        >
          Compare gains from different time periods. Select a time period below
          to view the buy price, recent price, and percent gain.
        </span>
      </div>
      <div className={styles["dates"]}>
        {dates.map((date, index) => (
          <Date key={index} date={date} />
        ))}
        <button className={styles["add-date"]}>
          <PlusSVG className={styles["plus-svg"]} />
        </button>
      </div>
    </div>
  );
};

export default Gain;
