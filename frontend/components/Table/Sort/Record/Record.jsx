import styles from "./Record.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

import DataIcon from "@/public/static/data.svg";
import TableIcon from "@/public/static/csv.svg";

const server = process.env.NEXT_PUBLIC_SERVER;
const Record = (props) => {
  const cik = useSelector(selectCik);
  const variant = props.variant || "json";
  return (
    <a
      href={`${server}/filers/record${
        variant === "csv" ? "csv" : ""
      }?cik=${cik}`}
      target="_blank"
    >
      <button className={styles["record-button"]}>
        <span className={[styles["record-text"], inter.className].join(" ")}>
          {variant === "csv" ? "Table" : "Raw"}
        </span>
        {variant === "csv" ? (
          <TableIcon className={styles["record-icon"]} />
        ) : (
          <DataIcon className={styles["record-icon"]} />
        )}
      </button>
    </a>
  );
};

export default Record;
