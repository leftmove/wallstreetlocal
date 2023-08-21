import styles from "./Recommended.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "700" });
const interBold = Inter({ subsets: ["latin"], weight: "900" });
const interLight = Inter({ subsets: ["latin"], weight: "500" });

import Link from "next/link";

import filers from "@/public/static/recommended.json";

const maxLength = 300;

const Recommended = () => {
  return (
    <div className={styles["recommended"]}>
      <span
        className={[styles["recommended-title"], interBold.className].join(" ")}
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
