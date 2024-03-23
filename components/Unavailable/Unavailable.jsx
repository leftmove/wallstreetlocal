import styles from "./Unavailable.module.css";

import Link from "next/link";

import { font } from "@fonts";

import useEllipsis from "@/components/Hooks/useEllipsis";

const Unavailable = (props) => {
  const type = props.type || "stocks";
  const cik = type == "stocks" ? props.cik : null;
  const text = props.text || null;

  const interval = 300;
  const pause = type == "loading" ? false : true;
  const { ellipsis } = useEllipsis(interval, pause);
  return (
    <div className={[styles["error-container"], font.className].join(" ")}>
      {type == "stocks" ? (
        text ? (
          <span>{text}</span>
        ) : (
          <div>
            <span>Unable to get stock data. Try again later or </span>
            <Link
              href={
                "https://www.sec.gov/cgi-bin/browse-edgar?" +
                new URLSearchParams({ CIK: cik.padStart(10, 0) })
              }
              className={styles["error-link"]}
              target="_blank"
            >
              visit the SEC directly.
            </Link>
          </div>
        )
      ) : null}
      {type == "loading" ? (
        <div>
          <span>Loading {ellipsis}</span>
        </div>
      ) : null}
    </div>
  );
};

export default Unavailable;
