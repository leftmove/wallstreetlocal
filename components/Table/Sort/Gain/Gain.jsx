import styles from "./Gain.module.css";
import { useState } from "react";

import { selectDates, newDate } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { SortableList } from "./SortableList/SortableList";

import Select from "./Select/Select";
import Trash from "./trash.svg";
import Plus from "./plus.svg";

const Gain = () => {
  const dates = useSelector(selectDates);
  const dispatch = useDispatch();

  // const { isOver, setTrashRef } = useDroppable({
  //   id: "trash",
  // });
  // const [drag, setDrag] = useState(false);

  // const handleDragStart = () => {
  //   setDrag(true)
  // }
  // const handleDragMove = (event) => {}
  // const handleDragOver = (event) => {
  //   setDrag(false)
  // }

  const [items, setItems] = useState([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={styles["gains-container"]}>
      {/* <div className={styles["header"]}>
        <span className={[styles["header-title"], inter.className].join(" ")}>
          Gains
        </span>
        <span
          className={[styles["header-description"], inter.className].join(" ")}
        >
          Compare gains from different time periods. Select a time period below
          to view the buy price, recent price, and percent gain.
        </span>
      </div> */}
      {/* <SortableList
        items={items}
        onChange={setItems}
        renderItem={(item) => (
          <SortableList.Item id={item}>
            {item}
            <SortableList.DragHandle />
          </SortableList.Item>
        )}
      /> */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        autoScroll={false}
      >
        <SortableContext
          items={dates.map((date) => date.accessor)}
          strategy={horizontalListSortingStrategy}
        >
          {dates.map((date, index) => (
            <Select
              key={date.accessor}
              id={date.accessor}
              index={index}
              date={date}
            />
          ))}
        </SortableContext>
        <div className={styles["drop-buttons"]}>
          <button
            className={[
              styles["drop-button"],
              // drag ? styles["drop-button-drag"] : "",
            ].join(" ")}
            onClick={() => dispatch(newDate())}
          >
            <Plus />
          </button>
          <div
            className={[
              styles["drop-button"],
              // drag ? styles["drop-button-drag"] : "",
            ].join(" ")}
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
