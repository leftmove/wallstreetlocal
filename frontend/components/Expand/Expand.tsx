import { useState } from "react";
import styles from "./Expand.module.css";
import ExpandSVG from "@/public/static/expand.svg";
import { FC } from "react";

interface ExpandProps {
  onClick: () => void;
  expandState?: boolean;
}

const Expand: FC<ExpandProps> = ({ onClick, expandState }) => {
  const [clickState, setClick] = useState<boolean>(false);
  const click = expandState ? expandState : clickState;

  return (
    <button
      className={[styles.expand, click ? styles.clicked : ""].join(" ")}
      onClick={() => {
        setClick(!click);
        onClick();
      }}
    >
      <ExpandSVG />
    </button>
  );
};

export default Expand;