import styles from "./Source.module.css";

import SourceIcon from "@/public/static/contact.svg";

const Source = (props) => {
  const cik = props.cik || null;
  const color = props.color || "dark";
  return cik ? (
    <button
      className={[
        styles["source-button"],
        color === "light" ? styles["source-light"] : "",
      ].join(" ")}
      onClick={() =>
        window.open(
          "https://www.sec.gov/cgi-bin/browse-edgar?" +
            new URLSearchParams({ CIK: cik.padStart(10, 0) }),
          "_blank"
        )
      }
    >
      <SourceIcon className={styles["source-svg"]} />
    </button>
  ) : null;
};

export default Source;
