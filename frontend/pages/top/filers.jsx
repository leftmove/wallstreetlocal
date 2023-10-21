import styles from "@/styles/Top.module.css";

import Head from "next/head";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "800" });

import axios from "axios";

const headers = [
  { display: "Name", accessor: "name" },
  { display: "CIK", accessor: "cik" },
  { display: "Market Value (Sorted)", accessor: "market_value" },
  { display: "Last Updated", accessor: "updated" },
];

const TopFilers = (props) => {
  return (
    <>
      <Head>
        <title>Top Filers</title>
      </Head>
      <div className={styles["header"]}>
        <span className={[styles["main-header"], inter.className].join(" ")}>
          Top Filers
        </span>
      </div>
      <div className={styles["description"]}>
        <span
          className={[styles["description-text"], inter.className].join(" ")}
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
                    inter.className,
                  ].join(" ")}
                >
                  {header.display}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.filers.map((filer) => (
              <tr>
                {headers.map((header) => (
                  <td>{filer[header.accessor]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const server = process.env.NEXT_PUBLIC_SERVER_URL;
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
