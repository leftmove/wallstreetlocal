import styles from "../Gain.module.css";

import { useDispatch } from "react-redux";
import { newDate } from "@/redux/filerSlice";

import PlusSVG from "./plus.svg";

const Plus = (props) => {
  const event = props.event;
  const dispatch = useDispatch();

  return (
    <button
      className={[
        styles["drop-button"],
        // event ? styles["drop-button-drag"] : "",
      ].join(" ")}
      onClick={() => dispatch(newDate())}
    >
      <PlusSVG />
    </button>
  );
};

export default Plus;
