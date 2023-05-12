import styles from "./Picker.module.css";
import { useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import CalendarSVG from "./calendar.svg";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Picker = () => {
  const dateSelected = new Date();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles["picker"]}>
      <button onClick={() => setOpen(!open)} className={styles["date"]}>
        <span className={[styles["date-text"], inter.className].join(" ")}>
          {dateSelected.toLocaleDateString()}
        </span>
        <CalendarSVG className={styles["calendar-svg"]} />
      </button>
      <div
        className={[styles["date-display"]].join(" ")}
        style={
          open
            ? {
                opacity: "1",
                marginTop: "-93px",
              }
            : {
                opacity: "0",
                marginTop: "0px",
              }
        }
      >
        {months.map((month) => (
          <div
            key={month}
            className={[styles["month"], inter.className].join(" ")}
          >
            {month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Picker;
