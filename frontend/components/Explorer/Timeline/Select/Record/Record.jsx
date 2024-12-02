import styles from "./Record.module.css";

import { useSelector } from "react-redux";

import { font } from "components/fonts";

import DataIcon from "@/public/static/data.svg";
import TableIcon from "@/public/static/csv.svg";
import { selectCik } from "@/redux/generalSlice";

const server = process.env.NEXT_PUBLIC_SERVER;
const Record = (props) => {
  const cik = useSelector(selectCik);
  const variant = props.variant || "json";
  const selected = props.selected;
  const headers = variant == "csv" ? props.headers : null;

  const handleJSONDownload = () => {
    window.open(
      server +
        "/filers/record/filing?" +
        new URLSearchParams({ cik, access_number: selected.access }).toString(),
      "_blank"
    );
  };
  const handleCSVDownload = () => {
    window.open(
      server +
        "/filers/record/filingcsv?" +
        new URLSearchParams({
          cik,
          access_number: selected.access,
          headers: JSON.stringify(headers.map(({ tooltip, ...rest }) => rest)),
        }),
      "_blank"
    );
  };
  return (
    <button
      className={[styles["record"], font.className].join(" ")}
      onClick={() =>
        variant === "csv" ? handleCSVDownload() : handleJSONDownload()
      }
    >
      <span className={font.className}>
        {variant == "csv" ? "Table" : "Data"}
      </span>
      {variant == "csv" ? (
        <TableIcon className={styles["record-icon"]} />
      ) : (
        <DataIcon className={styles["record-icon"]} />
      )}
    </button>
  );
};

export default Record;
