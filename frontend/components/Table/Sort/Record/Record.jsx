import styles from "./Record.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

import DataIcon from "@/public/static/data.svg";

const Record = () => {
  const cik = useSelector(selectCik);
  return (
    <a href={`/api/filers/record?cik=${cik}`} target="_blank">
      <button className={styles["record-button"]}>
        <span className={[styles["record-text"], inter.className].join(" ")}>
          Download
        </span>
        <DataIcon className={styles["record-icon"]} />
      </button>
    </a>
  );
};

export default Record;
