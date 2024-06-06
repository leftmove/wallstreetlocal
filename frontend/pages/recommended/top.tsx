import styles from "@/styles/Top.module.css";

import Head from "next/head";
import Link from "next/link";

import axios from "axios";

import { font } from "@fonts";
import { convertTitle } from "components/Filer/Info";

interface Header {
  display: string;
  accessor: string;
}

interface Filer {
  name: string;
  cik: string;
  market_value: string;
  date: string;
  [key: string]: any;
}

interface TopProps {
  filers: Filer[];
}

const headers: Header[] = [
  { display: "Name", accessor: "name" },
  { display: "CIK", accessor: "cik" },
  { display: "Assets Under Management", accessor: "market_value" },
  { display: "Last Updated", accessor: "date" },
];

const Top: React.FC<TopProps> = (props) => {
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
          The following contains links and information for{" "}
          <span className={styles["description-link"]}>
            <Link
              href="https://en.wikipedia.org/wiki/List_of_asset_management_firms"
              target="_blank"
            >
              the top investing firms
            </Link>
          </span>{" "}
          in America, sorted by market value. All filers may not have info
          readily available, or be sorted correctly.
        </span>
      </div>
      <div className={styles["table-container"]}>
        <table className={styles["table"]}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header.display}
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
                        display = convertTitle(display);
                        display = (
                          <Link
                            href={`/filers/${filer.cik}`}
                            className={styles["column-link"]}
                          >
                            {display.replace(/(^\w|\s\w)/g, (m) =>
                              m.toUpperCase()
                            )}
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
                        key={header.accessor}
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

export default Top;