import styles from "./Source.module.css";

import SourceIcon from "@/public/static/contact.svg";

const Source = (props) => {
  const cik = props.cik || null;
  const color = props.color || "dark";
  const link =
    props.link ||
    (cik
      ? "https://www.sec.gov/cgi-bin/browse-edgar?" +
        new URLSearchParams({ CIK: cik.padStart(10, 0) })
      : null);
  const width = props.width || "20px";
  const marginLeft = props.marginLeft || "";
  const marginRight = props.marginRight || "";
  return (
    <button
      className={[
        styles["source-button"],
        color === "light" ? styles["source-light"] : "",
        props.className || "",
      ].join(" ")}
      style={{ width, marginLeft, marginRight }}
      onClick={() => window.open(link, "_blank")}
    >
      <SourceIcon className={styles["source-svg"]} />
    </button>
  );
};

export default Source;
