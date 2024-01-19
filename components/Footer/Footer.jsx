import styles from "./Footer.module.css";

import Link from "next/link";
import { font } from "@fonts";

const Footer = () => {
  return (
    <div className={styles["footer"]}>
      <div className={styles["logo"]}>
        <Link href="/">
          <span
            className={styles["logo-text"] + " " + font.className}
            id={styles["whale"]}
          >
            <i>wallstreet</i>
          </span>
          <span
            className={styles["logo-text"] + " " + font.className}
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
