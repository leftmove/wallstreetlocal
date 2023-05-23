import styles from "./Gain.module.css";
import { useState } from 'react';

import { selectDates, newDate } from "@/redux/dateSlice";
import { useDispatch, useSelector } from "react-redux";

import { DndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";

import Select from "./Select/Select";
import Trash from "./trash.svg";
import Plus from "./plus.svg";

const Gain = () => {
  const dates = useSelector(selectDates);
  const dispatch = useDispatch();

  const { isOver, setTrashRef } = useDroppable({
    id: "trash",
  });
  const [drag, setDrag] = useState(false);
  

  const handleDragStart = () => {
    setDrag(true)
  }
  const handleDragMove = (event) => {}
  const handleDragOver = (event) => {
    setDrag(false)
  }

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
      <DndContext onDragOver={handleDragOver}>
        <div className={styles["dates"]}>
          {dates.map((date, index) => (
            <Select key={index} date={date} />
          ))}
        </div>
        <div className={styles["drop-buttons"]}>
          <button
            className={[styles["drop-button"], drag ? styles["drop-button-drag"] : ""].join(" ")}
            onClick={() => dispatch(newDate())}
          >
            <Plus />
          </button>
          <div
            className={[styles["drop-button"], drag ? styles["drop-button-drag"] : ""].join(" ")}
            ref={setTrashRef}
            onClick={() => dispatch(removeDate())}
          >
            <Trash />
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default Gain;
