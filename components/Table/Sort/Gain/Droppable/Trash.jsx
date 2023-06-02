import styles from "../Gain.module.css";

import { useDispatch } from "react-redux";
import { removeDate } from "@/redux/filerSlice";

import TrashSVG from "./trash.svg";

const Trash = (props) => {
  const event = props.event;
  const dispatch = useDispatch();

  return (
    <button
      className={[
        styles["drop-button"],
        // event ? styles["drop-button-drag"] : "",
      ].join(" ")}
      onClick={() => dispatch(removeDate())}
    >
      <TrashSVG />
    </button>
  );
};

export default Trash;
