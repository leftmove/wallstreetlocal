import styles from "./Tip.module.css";

import { fontLight } from "@fonts";

const Tip = (props) => {
  const top = props.top || null;
  return (
    <span
      className={[styles["tip"], fontLight.className].join(" ")}
      style={top ? { marginTop: top } : {}}
    >
      {props.text}
    </span>
  );
};

export default Tip;
