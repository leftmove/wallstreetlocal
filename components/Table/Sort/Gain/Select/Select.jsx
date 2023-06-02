import styles from "./Select.module.css";
import { useState, useRef } from "react";

import { useDispatch } from "react-redux";
import { newDate, removeDate } from "@/redux/filerSlice";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Picker from "./Picker/Picker";
import Minus from "./minus.svg";

const Select = (props) => {
  const date = props.date;
  const accessor = date.accessor;
  const index = props.index;

  const dispatch = useDispatch();
  const getTimeseries = (accessor) => {};

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: accessor });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      className={styles["date"]}
      ref={setNodeRef}
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
      <button
        className={[styles["button"], inter.className].join(" ")}
        onClick={() => {}}
      >
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
