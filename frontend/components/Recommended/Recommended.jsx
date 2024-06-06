import styles from "./Recommended.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { font } from "@fonts";
import { convertTitle } from "components/Filer/Info";

const server = process.env.NEXT_PUBLIC_SERVER;

interface Filer {
  cik: string;
  name: string;
  title?: string;
}

interface RecommendedProps {
  variant?: "default" | "homepage";
  className?: string;
}

const Recommended: React.FC<RecommendedProps> = (props) => {
  const variant = props.variant || "default";
  const [show, setShow] = useState(false);
  const [topFilers, setTopFilers] = useState<Filer[]>([]);
  const [searchedFilers, setSearchedFilers] = useState<Filer[]>([]);

  useEffect(() => {
    topFilers.length === 0
      ? null
      : axios
          .get(server + "/filers/top")
          .then((r) => r.data)
          .then((data) => setTopFilers(data.filers || []));

    searchedFilers.length === 0
      ? null
      : axios
          .get(server + "/filers/searched")
          .then((r) => r.data)
          .then((data) => setSearchedFilers(data.filers || []));

    const handleScroll = () => {
      setShow(true);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [topFilers, searchedFilers]);

  return (
    <div
      className={[
        styles["recommended"],
        variant === "homepage"
          ? show
            ? styles["recommended-slide-up"]
            : ""
          : "",
        variant === "homepage" ? styles["recommended-homepage"] : "",
        props.className || "",
      ].join(" ")}
    >
      <span className={[styles["recommended-title"], font.className].join(" ")}>
        Recommended Filers
      </span>
      <div className={[styles["recommended-lists"], font.className].join(" ")}>
        <div className={styles["recommended-list"]}>
          <Link href="/recommended/top">
            <span className={styles["list-title"]}>Most Assets</span>
          </Link>
          <ul>
            {topFilers
              .slice(0, 5)
              .map((f) => {
                return { ...f, title: convertTitle(f.name) };
              })
              .map((filer) => (
                <li key={filer.cik} className={styles["recommended-item"]}>
                  <Link href={`/filers/${filer.cik}`}>
                    <span>{convertTitle(filer.title)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className={styles["recommended-list"]}>
          <Link href="/recommended/searched">
            <span className={styles["list-title"]}>Most Searched</span>
          </Link>
          <ul>
            {searchedFilers
              .slice(0, 5)
              .map((f) => {
                return { ...f, title: convertTitle(f.name) };
              })
              .map((filer) => (
                <li className={styles["recommended-item"]} key={filer.cik}>
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

export default Recommended;