import styles from "./Headers.module.css";
import { useState, useReducer } from "react";

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
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Header from "./Header/Header";

interface HeaderProps {
  accessor: string;
  display: string;
  tooltip: string;
  active: boolean;
}

interface HeadersProps {
  headers: HeaderProps[];
  sold: boolean;
  na: boolean;
  updateDescription: (description: { title: string; text: string }) => void;
  updateHeaders: (newHeaders: HeaderProps[]) => void;
  updateActivation: (accessor: string) => void;
  updateSold: () => void;
  updateNa: () => void;
}

const Headers: React.FC<HeadersProps> = (props) => {
  const headers = props.headers;
  const sold = props.sold;
  const na = props.na;

  const [event, setEvent] = useReducer((prev: any, next: any) => {
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

  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const count = headers.length;

  const updateDescription = (description: { title: string; text: string }) =>
    props.updateDescription(description);
  const updateHeaders = (newHeaders: HeaderProps[]) => props.updateHeaders(newHeaders);
  const updateActivation = (accessor: string) => props.updateActivation(accessor);
  const updateSold = () => props.updateSold();
  const updateNa = () => props.updateNa();

  const handleDragStart = (e: any) => {
    const header = headers.find((h) => h.accessor === e.active.id);
    setEvent({ ...e, dragging: true, header });
  };
  const handleDragEnd = (e: any) => {
    const active = e.active;
    const over = e.over;

    setEvent({
      ...e,
      dragging: false,
      header: null,
    });
    if (!over) return;

    const activeIndex = headers.findIndex(
      ({ accessor }) => accessor === active.id
    );
    const overIndex = headers.findIndex(({ accessor }) => accessor === over.id);
    const updatedHeaders = arrayMove(headers, activeIndex, overIndex);
    updateHeaders(updatedHeaders);
  };

  const handleMouseEnter = (event: React.MouseEvent, title: string, text: string) => {
    setDelayHandler(setTimeout(() => updateDescription({ title, text }), 300));
  };
  const handleMouseLeave = () => {
    clearTimeout(delayHandler!);
  };
  return (
    <div className={styles["headers-everything"]}>
      <div className={styles["headers-buttons"]}>
        <DndContext
          sensors={sensors}
          autoScroll={false}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles["headers-container"]}>
            <SortableContext
              items={headers.map((header) => header.accessor)}
              strategy={horizontalListSortingStrategy}
            >
              {headers.map((h, index) => (
                <Header
                  key={h.accessor}
                  id={h.accessor}
                  header={h}
                  index={index}
                  count={count}
                  activate={() => updateActivation(h.accessor)}
                  onMouseEnter={(event) =>
                    handleMouseEnter(event, h.display, h.tooltip)
                  }
                  onMouseLeave={(event) => handleMouseLeave(event)}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {event.header ? (
                <Header id={event.header.accessor} header={event.header} />
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
      <div className={styles["headers-buttons"]}>
        <Header
          header={{ display: "Sold", active: sold }}
          activate={() => updateSold()}
          fixed={true}
          onMouseEnter={(event) =>
            handleMouseEnter(
              event,
              "Sold",
              "Filter or include stocks which have been sold."
            )
          }
          onMouseLeave={(event) => handleMouseLeave(event)}
        />
        <Header
          header={{ display: "Unavailable", active: na }}
          activate={() => updateNa()}
          fixed={true}
          onMouseEnter={(event) =>
            handleMouseEnter(
              event,
              "Unavailable",
              "Filter or include stocks with incomplete data on the current sorted property."
            )
          }
          onMouseLeave={(event) => handleMouseLeave(event)}
        />
      </div>
    </div>
  );
};

export default Headers;