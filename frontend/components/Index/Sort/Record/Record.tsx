import styles from "./Record.module.css";

import { useSelector } from "react-redux";
import { selectCik, selectHeaders } from "@/redux/filerSlice";

import Link from "next/link";

import { font } from "@fonts";

import DataIcon from "@/public/static/data.svg";
import TableIcon from "@/public/static/csv.svg";

const server = process.env.NEXT_PUBLIC_SERVER;

enum Variant {
  CSV = "csv",
  DEFAULT = ""
}

interface RecordProps {
  variant: Variant;
}

const Record: React.FC<RecordProps> = (props) => {
  const cik = useSelector(selectCik);
  const headers = useSelector(selectHeaders);
  const variant = props.variant === Variant.CSV ? Variant.CSV : Variant.DEFAULT;

  const headerString = JSON.stringify(headers);
  const url = new URL("/filers/record" + variant, server);
  url.searchParams.append("cik", cik);
  url.searchParams.append("headers", headerString);

  return (
    <Link href={url.toString()} target="_blank" className={styles["record-link"]}>
      <button className={styles["record-button"]}>
        <span className={[styles["record-text"], font.className].join(" ")}>
          {variant === Variant.CSV ? "Table" : "Data"}
        </span>
        {variant === Variant.CSV ? (
          <TableIcon className={styles["record-icon"]} />
        ) : (
          <DataIcon className={styles["record-icon"]} />
        )}
      </button>
    </Link>
  );
};

export default Record;