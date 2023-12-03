import styles from "./Recommended.module.css";
import { useEffect, useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "600" });
const interLight = Inter({ subsets: ["latin"], weight: "500" });
const interBold = Inter({ subsets: ["latin"], weight: "700" });

import Link from "next/link";

import filers from "@/public/static/recommended.json";

const maxLength = 200;

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
      <span
        className={[styles["recommended-title"], interBold.className].join(" ")}
      >
        Popular Filers
      </span>
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
                  className={[styles["suggestion-title"], inter.className].join(
                    " "
                  )}
                >
                  {filer.title}
                </span>
              </Link>
              <div
                className={[
                  styles["suggestion-ids"],
                  interLight.className,
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
                  interLight.className,
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
