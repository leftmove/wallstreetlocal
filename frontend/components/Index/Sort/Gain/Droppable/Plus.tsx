import styles from "../Gain.module.css";

import { useDispatch } from "react-redux";
import { newDate } from "@/redux/filerSlice";

import { useDroppable } from "@dnd-kit/core";

import PlusSVG from "./plus.svg";

interface PlusProps {
  event: {
    dragging: boolean;
    over: {
      id: string;
    };
  };
}

const Plus: React.FC<PlusProps> = (props) => {
  const { event } = props;

  const dispatch = useDispatch();

  const id = "plus";
  const { setNodeRef } = useDroppable({ id: id });

  return (
    <div>
      <button
        className={[
          styles["drop-button"],
          // event.dragging ? styles["drop-button-drag"] : "",
          // event.dragging && event.over.id === id
          //   ? styles["drop-button-over"]
          //   : "",
        ].join(" ")}
        onClick={() => dispatch(newDate())}
      >
        <PlusSVG className={styles["drop-svg"]} />
      </button>
    </div>
  );
};

export default Plus;