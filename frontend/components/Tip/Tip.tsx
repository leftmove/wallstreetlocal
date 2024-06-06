import styles from "./Tip.module.css";

import { fontLight } from "@fonts";

interface TipProps {
  top?: number | null;
  text: string;
}

const Tip: React.FC<TipProps> = (props) => {
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