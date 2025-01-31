import styles from "./Suggested.module.css";
import { useEffect, useState } from "react";

import axios from "axios";

import Link from "next/link";

import { font } from "@fonts";

import { convertTitle } from "components/Filer/Info";

const server = process.env.NEXT_PUBLIC_SERVER;
const Suggested = (props) => {
  const variant = props.variant || "default";
  const [show, setShow] = useState(false);
  const [topFilers, setTopFilers] = useState([]);
  const [searchedFilers, setSearchedFilers] = useState([]);
  useEffect(() => {
    topFilers == []
      ? null
      : axios
          .get(server + "/filers/top")
          .then((r) => r.data)
          .then((data) => setTopFilers(data.filers || null));
    searchedFilers == []
      ? null
      : axios
          .get(server + "/filers/searched")
          .then((r) => r.data)
          .then((data) => setSearchedFilers(data.filers || null));

    window.addEventListener(
      "scroll",
      () => {
        setShow(true);
      },
      true
    );
    return () => window.removeEventListener("scroll", () => {}, true);
  }, []);

  return (
    <div
      className={[
        styles["Suggested"],
        variant === "homepage"
          ? show
            ? styles["Suggested-slide-up"]
            : ""
          : "",
        variant === "homepage" ? styles["Suggested-homepage"] : "",
        props.className || "",
      ].join(" ")}
    >
      <span className={[styles["Suggested-title"], font.className].join(" ")}>
        Suggested Filers
      </span>
      <div className={[styles["Suggested-lists"], font.className].join(" ")}>
        <div className={styles["Suggested-list"]}>
          <Link href="/Suggested/top">
            <span className={styles["list-title"]}>Most Valued</span>
          </Link>
          <ul>
            {topFilers
              .slice(0, 5)
              .map((f) => {
                return { ...f, title: convertTitle(f.name) };
              })
              .map((filer) => (
                <li key={filer.cik} className={styles["Suggested-item"]}>
                  <Link href={`/filers/${filer.cik}`}>
                    <span>{convertTitle(filer.title)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className={styles["Suggested-list"]}>
          <Link href="/Suggested/searched">
            <span className={styles["list-title"]}>Most Searched</span>
          </Link>
          <ul>
            {searchedFilers
              .slice(0, 5)
              .map((f) => {
                return { ...f, title: convertTitle(f.name) };
              })
              .map((filer) => (
                <li className={styles["Suggested-item"]} key={filer.cik}>
                  <Link href={`/filers/${filer.cik}`}>
                    <span>{filer.title}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Suggested;
