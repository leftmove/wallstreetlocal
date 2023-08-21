import styles from "./Recommended.module.css";
import { useEffect, useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "700" });
const interLight = Inter({ subsets: ["latin"], weight: "500" });

import Link from "next/link";

import filers from "@/public/static/recommended.json";

const maxLength = 300;

const Recommended = () => {
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
        show ? styles["recommended-slide-up"] : "",
      ].join(" ")}
      onScroll={(e) => console.log(e)}
    >
      <span
        className={[styles["recommended-title"], inter.className].join(" ")}
      >
        Recommended Filers
      </span>

      <div className={styles["recommended-list"]}>
        {filers.map((filer) => {
          const description =
            filer.description.length > maxLength
              ? filer.description.slice(0, maxLength) + "..."
              : filer.description;
          return (
            <Link key={filer.cik} href={`/filers/${filer.cik}`}>
              <div className={styles["suggestion"]}>
                <span
                  className={[styles["suggestion-title"], inter.className].join(
                    " "
                  )}
                >
                  {filer.title}
                </span>
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
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default Recommended;
