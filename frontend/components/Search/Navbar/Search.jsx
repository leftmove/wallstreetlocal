import styles from "./Search.module.css";
import { useEffect, useState } from "react";

import axios from "axios";
import useSWR from "swr";

import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "800" });

const fetcher = (url, input) =>
  axios
    .get(url, { params: { q: input } })
    .then((res) => res.data)
    .catch((e) => console.error(e));

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const { data } = useSWR(
    searchInput ? ["/api/filers/search/", searchInput] : null,
    ([url, input]) => fetcher(url, input),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  useEffect(() => {
    if (data) {
      setResults(data.results);
    }
  }, [data]);

  return (
    <div className={styles["search"]}>
      <div className={styles["search-box"]}>
        <input
          type="text"
          className={[styles["search-input"], inter.className].join(" ")}
          value={searchInput}
          placeholder={isFocused ? "" : "Search..."}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <div
        className={[
          styles["results"],
          isFocused && searchInput ? styles["results-expand"] : "",
        ].join(" ")}
      >
        {
          <ul className={styles["result-list"]}>
            {results.map((result) => {
              return (
                <li key={result.cik}>
                  <Link href={`/filers/${result.cik}`}>
                    <div className={styles["result"]}>
                      <span className={inter.className}>
                        {result.name.toUpperCase()}{" "}
                        {result.tickers.length == 0
                          ? ""
                          : `(${result.tickers.join(", ")})`}
                      </span>
                      <span className={inter.className}>
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
