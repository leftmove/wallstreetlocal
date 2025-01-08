import styles from "./Search.module.css";
import { useEffect, useReducer, useState } from "react";

import axios from "axios";
import useSWR from "swr";

import { isMobile } from "react-device-detect";
import { Toaster, toast } from "sonner";

import Link from "next/link";
import { font, fontLight } from "@fonts";

const server = process.env.NEXT_PUBLIC_SERVER;
const fetcher = (url, query, limit) =>
  axios
    .get(url, { params: { q: query, limit } })
    .then((res) => res.data)
    .catch((e) => console.error(e));

const Search = () => {
  const [input, setInput] = useReducer(
    (prev, next) => {
      return { ...prev, ...next };
    },
    {
      search: "",
      results: [],
      focus: false,
    }
  );

  const limit = 5;
  const { data } = useSWR(
    input.search ? [server + "/filers/search", input.search, limit] : null,
    ([url, query, limit]) => fetcher(url, query, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  useEffect(() => {
    if (data) {
      setInput({ results: data.results });
    } else {
      setInput({ results: [] });
    }
  }, [data]);

  const [stateToast, setToast] = useState(false);
  useEffect(() => {
    if (isMobile && !stateToast) {
      toast.warning(
        "Mobile support is limited and not actively developed, please use a desktop browser.",
        { duration: 1000 * 30, closeButton: true }
      );
      setToast(true);
    }
  }, []);

  return (
    <div
      className={[
        styles["search"],
        input.focus ? styles["search-expand"] : "",
      ].join(" ")}
    >
      <Toaster
        className={fontLight.className}
        toastOptions={{
          style: {
            color: "var(--primary)",
            outline: "var(--secondary-dark)",
            borderColor: "var(--primary-dark)",
            background: "var(--secondary)",
          },
        }}
      />
      <div className={styles["search-box"]}>
        <input
          type="text"
          className={[styles["search-input"], font.className].join(" ")}
          value={input.search}
          placeholder={input.focus ? "" : "Search..."}
          onChange={(e) => setInput({ search: e.target.value })}
          onFocus={() => setInput({ focus: true })}
          onBlur={() => setInput({ focus: false })}
        />
      </div>
      <div
        className={[
          styles["results"],
          input.focus && input.search.length ? styles["results-expand"] : "",
        ].join(" ")}
      >
        {
          <ul className={styles["result-list"]}>
            {input.results.map((result) => {
              return (
                <li key={result.cik}>
                  <Link href={`/filers/${result.cik}`}>
                    <div className={styles["result"]}>
                      <span className={font.className}>
                        {result.name.toUpperCase()}{" "}
                        {result.tickers.length == 0
                          ? ""
                          : `(${result.tickers.join(", ")})`}
                      </span>
                      <span className={font.className}>
                        CIK{result.cik.padStart(10, "0")}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        }
      </div>
    </div>
  );
};

export default Search;
