import styles from "./Building.module.css";

import Link from "next/link";
import { Inter } from "@next/font/google";
const interLight = Inter({ subsets: ["latin"], weight: "700" });

import Loading from "@/components/Loading/Loading";

const Building = (props) => {
  return (
    <Link href={`/filers/${props.cik}?persist=true`}>
      <div className={[styles["building"]].join(" ")}>
        <span
          className={[styles["building-text"], interLight.className].join(" ")}
        >
          Filer building still partially in progress.
        </span>
        <Loading
          className={[styles["loading"], styles["no-background"]].join(" ")}
        />
      </div>
    </Link>
  );
};

export default Building;
