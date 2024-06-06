import styles from "../Gain.module.css";

import { useDroppable } from "@dnd-kit/core";

import { useDispatch } from "react-redux";
import { removeDate } from "@/redux/filerSlice";

import TrashSVG from "./trash.svg";

interface TrashProps {
  event: {
    dragging: boolean;
    over?: {
      id: string;
    };
  };
}

const Trash: React.FC<TrashProps> = (props) => {
  const { event } = props;
  const dispatch = useDispatch();

  const id = "trash";
  const { setNodeRef } = useDroppable({ id: id });

  return (
    <div ref={setNodeRef}>
      <button
        className={[
          styles["drop-button"],
          event.dragging ? styles["drop-button-drag"] : "",
          // event.dragging && event.over?.id === id
          //   ? styles["drop-button-over"]
          //   : "",
        ].join(" ")}
      >
        <TrashSVG className={styles["drop-svg"]} />
      </button>
    </div>
  );
};

export default Trash;