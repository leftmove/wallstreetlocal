import styles from "../Table.module.css";

import { useSelector } from "react-redux";
import { selectHeaders, selectSort } from "@/redux/features/stockSlice";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import SortButton from "./Sort/SortButton";

const Header = () => {
  const headers = useSelector(selectHeaders);
  const sort = useSelector(selectSort).sort;

  return (
    <tr>
      {headers
        .filter((h) => h.active)
        .map((h) => {
          const display = h.display;
          return (
            <th
              key={display}
              className={[
                styles["column"],
                styles["header-column"],
                h.sort == sort ? styles["column-highlighted"] : "",
                inter.className,
              ].join(" ")}
            >
              {display}
              <SortButton accessor={h.sort} />
            </th>
          );
        })}
    </tr>
  );
};

export default Header;
