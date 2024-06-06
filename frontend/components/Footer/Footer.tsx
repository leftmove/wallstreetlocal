import React from "react";
import styles from "./Footer.module.css";

import Link from "next/link";

import { font, fontLight } from "@fonts";

const Footer: React.FC = () => {
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
      <Link
        href="https://ko-fi.com/anonyon"
        target="_blank"
        className={[styles["donation"], fontLight.className].join(" ")}
      >
        <span>
          wallstreetlocal is free and open-source, please consider donating.
        </span>
      </Link>
    </div>
  );
};
export default Footer;