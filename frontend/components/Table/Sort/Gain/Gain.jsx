import styles from "./Gain.module.css";
import { useReducer } from "react";

import {
  selectDates,
  updateDates,
  newDate,
  openDate,
  removeDate,
} from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import Select from "./Select/Select";
import Plus from "./Droppable/Plus";
import Trash from "./Droppable/Trash";

// const measuringConfig = {
//   droppable: {
//     strategy: MeasuringStrategy.Always,
//   },
// };

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

  const [event, setEvent] = useReducer((prev, next) => {
    return { ...prev, ...next };
  }, {});
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
    })
  );

  const handleDragStart = (e) => {
    const date = dates.find((date) => date.id === e.active.id);

    setEvent({ ...e, dragging: true, date: date });
    dispatch(openDate({ accessor: e.active.id, open: false }));
  };
  const handleDragEnd = (e) => {
    const active = e.active;
    const over = e.over;

    setEvent({
      ...e,
      dragging: false,
      date: null,
    });

    if (!over) return;

    switch (over.id) {
      case "plus":
        dispatch(newDate());
        return;
      case "trash":
        dispatch(removeDate(active.id));
        return;
    }

    const activeIndex = dates.findIndex(({ id }) => id === active.id);
    const overIndex = dates.findIndex(({ id }) => id === over.id);
    const updatedDates = arrayMove(dates, activeIndex, overIndex);
    dispatch(updateDates(updatedDates));
  };

  return (
    <div className={styles["gains-container"]}>
      <DndContext
        sensors={sensors}
        autoScroll={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles["dates-container"]}>
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

          <DragOverlay>
            {event.date ? (
              <Select id={event.date.accessor} date={event.date} />
            ) : null}
          </DragOverlay>
        </div>

        <div className={styles["drop-buttons"]}>
          <Plus onClick={() => dispatch(newDate())} event={event} />
          <Trash event={event} />
        </div>
      </DndContext>
    </div>
  );
};

export default Gain;
