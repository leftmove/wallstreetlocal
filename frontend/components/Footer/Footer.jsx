import styles from "./Footer.module.css";

import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

const Footer = () => {
  return (
    <div className={styles["footer"]}>
      <div className={styles["logo"]}>
        <Link href="/">
          <span
            className={styles["logo-text"] + " " + inter.className}
            id={styles["whale"]}
          >
            <i>wallstreet</i>
          </span>
          <span
            className={styles["logo-text"] + " " + inter.className}
            id={styles["market"]}
          >
            {" "}
            local
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
