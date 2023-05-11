import styles from "./Picker.module.css";
import { useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import CalendarSVG from "./calendar.svg";

const Picker = () => {
  const date = new Date();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles["picker"]}>
      <button onClick={() => setOpen(!open)} className={styles["date"]}>
        <span className={[styles["date-text"], inter.className].join(" ")}>
          {date.toLocaleDateString()}
        </span>
        <CalendarSVG className={styles["calendar-svg"]} />
      </button>
      <div
        className={[styles["date-display"]].join(" ")}
        style={
          open
            ? {
                opacity: "1",
                marginTop: "63px",
              }
            : {
                opacity: "0",
                marginTop: "0px",
              }
        }
      ></div>
    </div>
  );
};

export default Picker;
