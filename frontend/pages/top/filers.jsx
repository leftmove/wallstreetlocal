import styles from "@/styles/Top.module.css";

import Head from "next/head";
import Link from "next/link";

import { font } from "@fonts";

import axios from "axios";

const headers = [
  { display: "Name", accessor: "name" },
  { display: "CIK", accessor: "cik" },
  { display: "Market Value (Sorted)", accessor: "market_value" },
  { display: "Last Updated", accessor: "date" },
];

const TopFilers = (props) => {
  return (
    <>
      <Head>
        <title>Top Filers</title>
      </Head>
      <div className={styles["header"]}>
        <span className={[styles["main-header"], font.className].join(" ")}>
          Top Filers
        </span>
      </div>
      <div className={styles["description"]}>
        <span
          className={[styles["description-text"], font.className].join(" ")}
        >
          The following consists of the top thirty investing firms in America,
          sorted by market value. Click on any filer to see extensive info from
          their filings.
        </span>
      </div>
      <div className={styles["table-container"]}>
        <table className={styles["table"]}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  className={[
                    styles["column"],
                    styles["header-column"],
                    font.className,
                  ].join(" ")}
                >
                  {header.display}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.filers.map((filer) => {
              return (
                <tr key={filer.cik}>
                  {headers.map((header) => {
                    const accessor = header.accessor;
                    let display = filer[accessor];
                    switch (accessor) {
                      case "name":
                        display = (
                          <Link
                            href={`/filers/${filer.cik}`}
                            className={styles["column-link"]}
                          >
                            {display.toUpperCase()}
                          </Link>
                        );
                        break;
                      case "cik":
                        display = display.padStart(10, "0");
                      case "date":
                      case "market_value":
                      default:
                        break;
                    }
                    return (
                      <td
                        className={[styles["column"], font.className].join(" ")}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps() {
  const data = await axios
    .get(server + "/filers/top")
    .then((r) => r.data)
    .catch((e) => console.log(e));
  const filers = data?.filers || [];
  return {
    props: {
      filers,
    },
  };
}

export default TopFilers;
