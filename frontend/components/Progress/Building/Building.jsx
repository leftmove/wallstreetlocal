import styles from "./Building.module.css";

import Link from "next/link";
import { fontLight } from "@fonts";

import Loading from "components/Loading/Loading";

const Building = (props) => {
  return (
    <Link href={`/filers/${props.cik}?persist=true`}>
      <div className={[styles["building"]].join(" ")}>
        <span
          className={[styles["building-text"], fontLight.className].join(" ")}
        >
          Filer's info is still being built, only the most recent data is shown.
        </span>
        <Loading
          className={[styles["loading"], styles["no-background"]].join(" ")}
        />
      </div>
    </Link>
  );
};

export default Building;
