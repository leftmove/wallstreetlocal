import styles from "./Gain.module.css";
import { useState } from "react";

import { selectDates } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import {
  DndContext,
  DragOverlay,
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
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import Select from "./Select/Select";
import Plus from "./Droppable/Plus";
import Trash from "./Droppable/Trash";

const Gain = () => {
  const dates = useSelector(selectDates);

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

  const [event, setEvent] = useState(null);
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

  const handleDragStart = (e) => {
    setEvent(e);
  };
  const handleDragEnd = (e) => {
    setEvent(e);
  };

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
          <Plus event={event} />
          <Trash event={event} />
        </div>
      </DndContext>
    </div>
  );
};

export default Gain;
