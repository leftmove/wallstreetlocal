import { useState } from "react";
import styles from "./Expand.module.css";

import ExpandSVG from "@/public/static/expand.svg";

const Expand = (props) => {
  const { onClick } = props;
  const [click, setClick] = useState(false);

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
