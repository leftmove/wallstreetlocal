import styles from "./Header.module.css";
import tableStyles from "../Table.module.css";

import { font } from "@fonts";

import Sort from "./sort.svg";

import React from "react";

interface HeaderProps {
  headers: Header[];
  sort: string;
  reverse: boolean;
  activate: (accessor: string, direction: boolean) => void;
}

interface Header {
  display: string;
  sort: string;
  active: boolean;
}

const Header: React.FC<HeaderProps> = (props) => {
  const headers = props.headers;
  const sort = props.sort;
  const reverse = props.reverse;
  const activateHeader = (accessor: string, direction: boolean) =>
    props.activate(accessor, direction);

  return (
    <tr>
      {headers
        .filter((h) => h.active)
        .map((h) => {
          return (
            <th
              key={h.display}
              className={[
                tableStyles["column"],
                tableStyles["header-column"],
                h.sort == sort
                  ? tableStyles["column-highlighted"]
                  : tableStyles["column-dehighlighted"],
                font.className,
              ].join(" ")}
            >
              <button
                onClick={() => activateHeader(h.sort, !reverse)}
                className={styles["column-button"]}
              >
                {h.display}
              </button>
              <button
                onClick={() => activateHeader(h.sort)}
                className={[
                  styles["button"],
                  sort === h.sort && reverse ? "" : styles["button-reverse"],
                  sort === h.sort ? styles["button-click"] : "",
                ].join(" ")}
              >
                <Sort className={[styles["button-image"]].join(" ")} />
              </button>
            </th>
          );
        })}
    </tr>
  );
};

export default Header;