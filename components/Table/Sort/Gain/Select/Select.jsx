import styles from "./Select.module.css";
import { useState, useRef } from "react";

import { useDispatch } from "react-redux";
import { newDate, removeDate } from "@/redux/dateSlice";

import { useDraggable } from "@dnd-kit/core";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Picker from "./Picker/Picker";
import Minus from "./minus.svg";

const Select = (props) => {
  const date = props.date;
  const index = props.key;

  const dispatch = useDispatch();
  const getTimeseries = (accessor) => {

  }

  const { attributes, listeners, setSelectRef, transform } = useDraggable({
    id: index
  })
  const style = transform ? {
    translateX: transform.x,
    translateY: transform.y,
  } : {}

  return (
    <button
      className={styles["date"]}
      ref={setSelectRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {/* <div className={styles["plus-minus"]}>
          <button
            className={styles["date-button"]}
            onClick={() => handleRemove()}
          >
            <Minus />
          </button>
          <button className={styles["date-button"]} onClick={() => handleAdd()}>
            <Plus />
          </button>
        </div> */}
      <Picker date={date} index={index} />
      <button className={[styles["button"], inter.className].join(" ")} onClick={() => { }}>
        Add to Table
      </button>
      <button
        className={[
          styles["button"],
          styles["download"],
          inter.className,
        ].join(" ")}
      >
        Download Data
      </button>
      {/* Make Green? */}
    </button>
  );
};

export default Select;
