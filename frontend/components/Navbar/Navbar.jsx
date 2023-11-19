import styles from "./Navbar.module.css";

import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Search from "@/components/Search/Button/Search";

const Navbar = (props) => {
  const variant = props.variant || null;
  return (
    <nav className={styles["nav"]}>
      <div className={styles["logo"]}>
        <div className={styles["logo-title"]}>
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
        {variant === "home" ? null : <Search />}
      </div>
      <div>
        <ul className={styles["about"]}>
          <li className={styles["item"] + " " + inter.className}>
            <Link href="/top/filers">top filers</Link>
          </li>
          {/* <li className={styles["item"] + " " + inter.className}>
          <Link href="/">about</Link>
        </li> */}
          <li className={styles["item"] + " " + inter.className}>
            <Link href="/about/resources">resources</Link>
          </li>
          {/* <li className={styles["item"] + " " + inter.className}>
          <Link href="/">pricing</Link>
        </li> */}
          <li className={styles["item"] + " " + inter.className}>
            <Link href="/about/contact">contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
