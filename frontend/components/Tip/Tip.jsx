import styles from "./Tip.module.css";

import { Inter } from "@next/font/google";
const interLight = Inter({ subsets: ["latin"], weight: "700" });

const Tip = (props) => {
  return (
    <span className={[styles["tip"], interLight.className].join(" ")}>
      {props.text}
    </span>
  );
};

export default Tip;
