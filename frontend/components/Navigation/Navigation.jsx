import styles from "./Navigation.module.css";
import { useState, useEffect } from "react";

import Link from "next/link";
import { font, fontLight } from "@fonts";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";

import Search from "components/Search/Button/Search";
import Bar from "components/Bar/Bar";
import Button from "components/Buttons/Primary";
import { cn } from "components/ui/utils";

import Logo from "public/static/logo-main.svg";
import CrossIcon from "@/public/static/cross.svg";
import { AlignJustify } from "lucide-react";

const fullConfig = resolveConfig(tailwindConfig);

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
  <li className="transition-colors duration-150 md:ml-4 list-non text-offwhite-one hover:text-offwhite-two">
    <Link href={link} target={tab ? "_blank" : null}>
      {text}
    </Link>
  </li>
);

const server = process.env.NEXT_PUBLIC_SERVER;
const Navigation = (props) => {
  const variant = props.variant || null;

  const [showNavigation, setShowNavigation] = useState(false);
  const handleShowNavigation = () => setShowNavigation(!showNavigation);
  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth >= parseInt(fullConfig.theme.screens.md) &&
        showNavigation
      ) {
        handleShowNavigation();
      }
    };
    const handleScroll = () => {
      if (showNavigation) {
        handleShowNavigation();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("wheel", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showNavigation]);

  return (
    <>
      <Bar />
      {/* <Banner /> */}
      <nav className="z-50 flex justify-between w-full h-16 font-medium font-switzer bg-black-two">
        <section className="flex items-center h-full ml-4 w-fit">
          <Link href="/">
            <Logo className="h-6" />
          </Link>
        </section>
        <button
          className="flex items-center justify-center mr-5 md:hidden"
          onClick={handleShowNavigation}
        >
          <AlignJustify className=" text-offwhite-one" color="currentColor" />
        </button>
        <section
          className={cn(
            "md:max-h-fit z-50 flex items-start border-t-2 border-green-one md:border-none justify-between w-full md:w-fit bg-black-two my-auto md:opacity-100 top-16 transition-all md:top-0 duration-300 absolute mr-4 md:items-center md:relative md:flex md:flex-row overflow-hidden",
            showNavigation ? "max-h-36  p-4" : "max-h-0 opacity-0"
          )}
        >
          <ul className="text-left md:text-center md:flex md:items-center text-nowrap">
            <Item link="/about" text="About" />
            <Item link="/examples" text="Examples" />
            <Item link="https://ko-fi.com/anonyon" text="Donate" tab />
            <Item
              link="https://github.com/leftmove/wallstreetlocal"
              text="Open Source"
              tab
            />
          </ul>
          <Button className=" md:block md:ml-4">Coming Soon</Button>
        </section>
      </nav>
    </>
  );
};

export default Navigation;
