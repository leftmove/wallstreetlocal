import styles from "./Share.module.css";

import { toast } from "sonner";

import ShareIcon from "@/public/static/share.svg";
import Toaster from "components/Toaster/Toaster";

const server = process.env.NEXT_PUBLIC_SERVER;

const Share = (props) => {
  const cik = props.cik || null;
  const an = props.an || null;
  const color = props.color || "dark";
  const variant = props.variant || "filers";
  const link =
    props.link ||
    (() => {
      switch (variant) {
        case "filers":
          return `/filers/${cik}/overview`;
        case "holdings":
          return `/filings/${cik}/${an}/holdings`;
      }
    })();
  const width = props.width || "20px";
  const marginLeft = props.marginLeft || "";

  const handleClick = () => {
    navigator.clipboard.writeText(window.location + link);
    toast("Copied link to clipboard!");
  };

  return (
    <button
      className={[
        styles["source-button"],
        color === "light" ? styles["source-light"] : "",
        props.className || "",
      ].join(" ")}
      style={{ width, marginLeft }}
      onClick={handleClick}
    >
      <ShareIcon className={styles["source-svg"]} />
      <Toaster />
    </button>
  );
};

export default Share;
