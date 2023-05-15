import styles from "./Select.module.css";
import { useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Picker from "./Picker/Picker";

const Select = (props) => {
  const date = props.date;
  const index= props.key

  return (
    <div className={styles["date"]}>
      <Picker date={date} index={index} />
      <button className={[styles["button"], inter.className].join(" ")}>
        Add to Table
      </button>
      <button
        className={[styles["button"], styles["download"], inter.className].join(
          " "
        )}
      >
        Download Data
      </button>
      {/* Make Green? */}
    </div>
  );
};

export default Select;
