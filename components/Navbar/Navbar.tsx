import styles from "./Navbar.module.css";

import Link from "next/link";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"], weight: "900" });

const Navbar = () => {
  return (
    <nav className={styles["nav"]}>
      <div className={styles["logo"]}>
        <Link href="/">
          <span
            className={styles["logo-text"] + " " + inter.className}
            id={styles["whale"]}
          >
            whale
          </span>
          <span
            className={styles["logo-text"] + " " + inter.className}
            id={styles["market"]}
          >
            {" "}
            market
          </span>
        </Link>
      </div>
      <ul className={styles["about"]}>
        <li className={styles["item"] + " " + inter.className}>
          <Link href="/">about</Link>
        </li>
        <li className={styles["item"] + " " + inter.className}>
          <Link href="/">resources</Link>
        </li>
        <li className={styles["item"] + " " + inter.className}>
          <Link href="/">pricing</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
