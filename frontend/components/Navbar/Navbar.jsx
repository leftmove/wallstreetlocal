import styles from "./Navbar.module.css";

import Link from "next/link";
import { font } from "@fonts";

import Search from "@/components/Search/Button/Search";

const Navbar = (props) => {
  const variant = props.variant || null;
  return (
    <nav className={styles["nav"]}>
      <div className={styles["logo"]}>
        <div className={styles["logo-title"]}>
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
        {variant === "home" ? null : <Search />}
      </div>
      <div>
        <ul className={styles["about"]}>
          <li className={styles["item"] + " " + font.className}>
            <Link href="/recommended/top">Top Filers</Link>
          </li>
          <li className={styles["item"] + " " + font.className}>
            <Link href="/recommended/searched">Popular Filers</Link>
          </li>
          {/* <li className={styles["item"] + " " + font.className}>
          <Link href="/">about</Link>
        </li> */}
          <li className={styles["item"] + " " + font.className}>
            <Link href="/about/resources">Resources</Link>
          </li>
          {/* <li className={styles["item"] + " " + font.className}>
          <Link href="/">pricing</Link>
        </li> */}
          <li className={styles["item"] + " " + font.className}>
            <Link href="https://github.com/bruhbruhroblox" target="_blank">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
