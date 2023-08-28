import styles from "@/styles/Resources.module.css";

import Head from "next/head";
import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

export default function Resources() {
  return (
    <>
      <Head>
        <title>wallstreetlocal | resources</title>
      </Head>{" "}
      <div className={styles["resources"]}>
        <div className={styles["resources-head"]}>
          <h1
            className={[styles["resources-header"], inter.className].join(" ")}
          >
            Resources
          </h1>
          <span
            className={[styles["resources-description"], inter.className].join(
              " "
            )}
          >
            All data used is publicly available via the SEC. The following
            contains useful links and information about SEC registered
            companies.
          </span>
        </div>
        <div className={styles["resources-body"]}>
          <div className={styles["resources-item"]}>
            <Link href="https://www.sec.gov/edgar/search/" target="_blank">
              <button
                className={[styles["resources-button"], inter.className].join(
                  " "
                )}
              >
                SEC EDGAR Search
              </button>
            </Link>
            <span
              className={[styles["button-tooltip"], inter.className].join(" ")}
            >
              (Add 13F to the filing category field to find companies that have
              filed 13F filings.)
            </span>
          </div>
          <div className={styles["resources-item"]}>
            <Link
              href="https://www.sec.gov/files/company_tickers.json"
              target="_blank"
            >
              <button
                className={[styles["resources-button"], inter.className].join(
                  " "
                )}
              >
                Ticker Archive
              </button>
            </Link>
            <span
              className={[styles["button-tooltip"], inter.className].join(" ")}
            >
              (Bulk Data via the SEC)
            </span>
          </div>
          <div className={styles["resources-item"]}>
            <Link
              href="https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip"
              target="_blank"
            >
              <button
                className={[styles["resources-button"], inter.className].join(
                  " "
                )}
              >
                Submissions Archive
              </button>
            </Link>
            <span
              className={[styles["button-tooltip"], inter.className].join(" ")}
            >
              (Bulk Data via the SEC)
            </span>
          </div>
          <div className={styles["resources-item"]}>
            <Link
              href="http://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip"
              target="_blank"
            >
              <button
                className={[styles["resources-button"], inter.className].join(
                  " "
                )}
              >
                Company Facts Archive
              </button>
            </Link>
            <span
              className={[styles["button-tooltip"], inter.className].join(" ")}
            >
              (Bulk Data via the SEC)
            </span>
          </div>
          <div className={styles["resources-item"]}>
            <Link href="https://www.sec.gov/forms" target="_blank">
              <button
                className={[styles["resources-button"], inter.className].join(
                  " "
                )}
              >
                Form Data
              </button>
            </Link>
            <span
              className={[styles["button-tooltip"], inter.className].join(" ")}
            >
              (Explanations for Different Form Types)
            </span>
          </div>
        </div>
        <span
          className={[styles["resources-description"], inter.className].join(
            " "
          )}
        >
          While data collected and formatted by wallstreetlocal is not available
          by bulk because of data costs, you can download resources for
          individual filers by visiting their respective pages.
        </span>
      </div>
    </>
  );
}
