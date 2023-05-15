import styles from "./Header.module.css";
import tableStyles from "../Table.module.css";

import { useDispatch, useSelector } from "react-redux";
import { selectHeaders, selectSort, sortHeader } from "@/redux/stockSlice";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Sort from "./sort.svg";

const Header = () => {
  const dispatch = useDispatch();

  const headers = useSelector(selectHeaders);
  const select = useSelector(selectSort);
  const sort = select.sort;
  const reverse = select.reverse;

  const activateHeader = (accessor) =>
    dispatch(
      sortHeader({
        sort: accessor,
        reverse: !reverse,
      })
    );

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
                h.sort == sort ? tableStyles["column-highlighted"] : "",
                inter.className,
              ].join(" ")}
            >
              <button
                onClick={() => activateHeader(h.sort)}
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
