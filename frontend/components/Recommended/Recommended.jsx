import styles from "styles/Recommended.module.css";

import Head from "next/head";
import Link from "next/link";

import Source from "components/Source/Source";
import { font, fontLight } from "fonts";
import { cn } from "components/ui/utils";
import { convertTitle } from "components/Filer/Info";

const headers = [
  { display: "Name", accessor: "name" },
  { display: "CIK", accessor: "cik" },
  { display: "Assets Under Management", accessor: "market_value" },
  { display: "Last Updated", accessor: "date" },
];

const Recommended = (props) => {
  return (
    <div className={cn("h-full bg-offwhite-one", props.className)}>
      <Head>
        <title>{props.title}</title>
      </Head>
      <div className={cn(styles["header"], "px-4 py-2")}>
        <span className={[font.className, "text-black-two text-4xl"].join(" ")}>
          {props.title}
        </span>
        <div className={[styles["description"], fontLight.className].join(" ")}>
          {props.description}
          <span>
            All filers may not have accurate or readily available info.
          </span>
        </div>
        <div className="flex justify-center w-full">
          <Link href={props.source}>
            <span
              className={[
                "opacity-50 hover:text-black-two",
                font.className,
              ].join(" ")}
            >
              Source
            </span>
          </Link>
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
                            href={`/filers/${filer.cik}/overview`}
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
                            <Source
                              marginLeft="0.5rem"
                              color="light"
                              cik={filer.cik}
                            />
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
    </div>
  );
};

export default Recommended;
