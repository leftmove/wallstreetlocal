import styles from "./Select.module.css";
import { useState } from "react";

import { useDispatch } from "react-redux";
import { newDate, removeDate } from "@/redux/dateSlice";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Picker from "./Picker/Picker";
import Plus from "./plus.svg";
import Minus from "./minus.svg";

const Select = (props) => {
  const date = props.date;
  const index = props.key;

  const dispatch = useDispatch();

  const [show, setShow] = useState(true);
  const handleRemove = () => {
    setShow(false);
    setTimeout(() => {
      dispatch(removeDate(date.accessor));
    }, 333);
  };

  return (
    <div
      className={styles["date"]}
      style={show ? {} : { transform: "translateX(-210px)", opacity: 0 }}
    >
      {/* style={show ? {} : { transform: "translateX(-210px)" }} */}
      <div className={styles["plus-minus"]}>
        <button
          className={styles["date-button"]}
          onClick={() => handleRemove()}
        >
          <Minus />
        </button>
        <button
          className={styles["date-button"]}
          onClick={() => dispatch(newDate())}
        >
          <Plus />
        </button>
      </div>
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
