import styles from "./Gain.module.css";
import { useState } from "react";

import { selectDates, newDate } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

// import { DndContext } from "@dnd-kit/core";
// import { useDroppable } from "@dnd-kit/core";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
      <DragDropContext>
        <Droppable dropppableId="dates">
          {(provided) => (
            <ul
              className={styles["dates"]}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {dates.map((date, index) => (
                <Draggable
                  key={date.accessor}
                  draggableId={date.accessor}
                  index={index}
                >
                  {(provided) => (
                    <li
                      className={styles["select-item"]}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <Select date={date} />
                    </li>
                  )}
                </Draggable>
              ))}
            </ul>
          )}
        </Droppable>
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
          <Droppable dropppableId="trash">
            {(provided) => (
              <div
                className={[
                  styles["drop-button"],
                  // drag ? styles["drop-button-drag"] : "",
                ].join(" ")}
                onClick={() => dispatch(removeDate())}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <Trash />
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Gain;
