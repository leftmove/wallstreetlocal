import styles from "./Record.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

import DataIcon from "@/public/static/data.svg";

const server = process.env.NEXT_PUBLIC_SERVER;
const Record = () => {
  const cik = useSelector(selectCik);
  return (
    <a href={`${server}/filers/record?cik=${cik}`} target="_blank">
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
