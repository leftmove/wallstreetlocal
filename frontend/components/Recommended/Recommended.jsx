import styles from "styles/Recommended.module.css";

import Head from "next/head";
import Link from "next/link";

import Source from "components/Source/Source";
import { font, fontLight } from "@fonts";
import { convertTitle } from "components/Filer/Info";

const headers = [
  { display: "Name", accessor: "name" },
  { display: "CIK", accessor: "cik" },
  { display: "Assets Under Management", accessor: "market_value" },
  { display: "Last Updated", accessor: "date" },
];

const Reccomended = (props) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <div className={styles["header"]}>
        <span className={[styles["main-header"], font.className].join(" ")}>
          {props.title}
        </span>
        <div className={[styles["description"], fontLight.className].join(" ")}>
          {props.description}
          <span>
            All filers may not have accurate or readily available info.
          </span>
        </div>
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
                        display = (
                          <div className={styles["cik-source"]}>
                            {display}
                            <Source color="light" cik={filer.cik} />
                          </div>
                        );
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
      <div className={styles["header"]}>
        <Link href={props.source}>
          <span className={[styles["footer-header"], font.className].join(" ")}>
            Source
          </span>
        </Link>
      </div>
    </>
  );
};

export default Reccomended;
