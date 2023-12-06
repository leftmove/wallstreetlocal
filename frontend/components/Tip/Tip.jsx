import styles from "./Tip.module.css";

import { fontLight } from "@fonts";

const Tip = (props) => {
  return (
    <span className={[styles["tip"], fontLight.className].join(" ")}>
      {props.text}
    </span>
  );
};

export default Tip;
