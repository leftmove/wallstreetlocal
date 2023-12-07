import styles from "./Recommended.module.css";
import { useEffect, useState } from "react";

import Link from "next/link";

import { font } from "@fonts";

import searchedFilers from "@/public/static/recommended.json";
import topFilers from "@/public/static/top.json";

const Recommended = (props) => {
  const variant = props.variant || "default";
  const [show, setShow] = useState(false);
  useEffect(() => {
    window.addEventListener(
      "scroll",
      () => {
        setShow(true);
      },
      true
    );
    return () => window.removeEventListener("scroll", () => {}, true);
  }, []);

  return (
    <div
      className={[
        styles["recommended"],
        variant === "homepage"
          ? show
            ? styles["recommended-slide-up"]
            : ""
          : "",
        variant === "homepage" ? styles["recommended-homepage"] : "",
      ].join(" ")}
    >
      <span className={[styles["recommended-title"], font.className].join(" ")}>
        popular filers
      </span>
      <div className={[styles["recommended-lists"], font.className].join(" ")}>
        <div className={styles["recommended-list"]}>
          <Link href="/top/filers">
            <span className={styles["list-title"]}>biggest</span>
          </Link>
          <ul>
            {searchedFilers.map((filer) => (
              <li className={styles["recommended-item"]}>
                <Link href={`/filers/${filer.cik}`}>
                  <span>{filer.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles["recommended-list"]}>
          <span className={styles["list-title"]}>most searched</span>
          <ul>
            {searchedFilers.map((filer) => (
              <li className={styles["recommended-item"]}>
                <Link href={`/filers/${filer.cik}`}>
                  <span>{filer.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 
      <div className={styles["recommended-list"]}>
        {filers.map((filer) => {
          const description =
            filer.description.length > maxLength
              ? filer.description.slice(0, maxLength) + "..."
              : filer.description;
          return (
            <div className={styles["suggestion"]}>
              <Link href={`/filers/${filer.cik}`}>
                <span
                  className={[styles["suggestion-title"], font.className].join(
                    " "
                  )}
                >
                  {filer.title}
                </span>
              </Link>
              <div
                className={[
                  styles["suggestion-ids"],
                  fontLight.className,
                ].join(" ")}
              >
                {filer.cik}{" "}
                {filer.tickers.length === 0
                  ? ""
                  : `(${filer.tickers.join(",   ")})`}
              </div>
              <span
                className={[
                  styles["suggestion-description"],
                  fontLight.className,
                ].join(" ")}
              >
                {description}
              </span>
            </div>
          );
        })}
      </div> */}
    </div>
  );
};
export default Recommended;
