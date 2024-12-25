import styles from "./Navigation.module.css";
import { useState, useEffect } from "react";

import Link from "next/link";
import { font, fontLight } from "@fonts";

import Search from "components/Search/Button/Search";
import Bar from "components/Bar/Bar";

import CrossIcon from "@/public/static/cross.svg";

const Banner = () => {
  const [show, setShow] = useState(null);
  useEffect(() => {
    if (show === null) {
      setShow(localStorage.getItem("banner") === "false" ? false : true);
    }
  }, []);
  useEffect(() => {
    if (show === null) return;
    localStorage.setItem("banner", show);
  }, [show]);
  return (
    show && (
      <div className={styles["banner"]}>
        <div className={styles["banner-info"]}>
          <span
            className={[fontLight.className, styles["banner-text"]].join(" ")}
          >
            This website is currently undergoing maintenance to improve
            reliability, performance, usability - you may experience some bugs
            as a result.
          </span>
        </div>
        <button
          className={styles["banner-close"]}
          onClick={() => setShow(false)}
        >
          <CrossIcon className={styles["banner-icon"]} />
        </button>
      </div>
    )
  );
};

const Item = ({ link, text, tab }) => (
  <li className={styles["item"] + " " + font.className}>
    <Link href={link} target={tab ? "_blank" : null}>
      {text}
    </Link>
  </li>
);

const server = process.env.NEXT_PUBLIC_SERVER;
const Navigation = (props) => {
  const variant = props.variant || null;
  return (
    <>
      <Bar />
      <Banner />
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
        <div className={styles["links"]}>
          <ul className={styles["links-list"]}>
            <Item link="/recommended/top" text="Top Filers" />
            <Item link="/recommended/searched" text="Popular Filers" />
            <Item link="/about/resources" text="Resources" />
            <Item link={server + "/docs"} text="API" tab={true} />
            <Item
              link="https://github.com/leftmove"
              text="Contact"
              tab={true}
            />
            <Item link="https://ko-fi.com/anonyon" text="Donate" tab={true} />
            <Item
              link="https://github.com/leftmove/wallstreetlocal"
              text="Source"
              tab={true}
            />
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
