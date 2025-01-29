import styles from "./Footer.module.css";

import Link from "next/link";
import { font, fontLight } from "fonts";
import { cn } from "components/ui/utils";

import Logo from "public/static/logo-main.svg";

const Footer = () => {
  return (
    <footer
      className={cn(
        "flex w-full font-switzer justify-center items-center bg-black-two p-4 border-t-2 border-green-two"
      )}
    >
      <div className={cn(styles["logo"], "flex items-center")}>
        <Link href="/">
          <Logo className="h-4" />
        </Link>
      </div>
      <Link
        href="https://ko-fi.com/anonyon"
        target="_blank"
        className={[fontLight.className, "ml-4 text-xs text-offwhite-one"].join(
          " "
        )}
      >
        <span className="opacity-50 text-white-one">
          wallstreetlocal is free and open-source, please consider donating.
        </span>
      </Link>
    </footer>
  );
};

export default Footer;
