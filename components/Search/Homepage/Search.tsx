import styles from "./Search.module.css";
import { useState } from "react";

import axios from "axios";
import useSWR from "swr";

import Link from "next/link";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [results, setResults] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (searchInput !== "") {
      axios
        .get("/api/filers/search", {
          params: {
            q: searchInput,
          },
        })
        .then((res) => res.data)
        .then((data) => {
          const results = data.results;
          setResults(results);
        })
        .catch((e) => console.error(e));
    }
  };

  return (
    <div
      className={
        styles["search"] +
        " " +
        (isFocused && searchInput && styles["search-expand"])
      }
    >
      <input
        type="text"
        className={styles["search-box"] + " " + inter.className}
        value={searchInput}
        placeholder={isFocused ? "" : "Search..."}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {
        <ul className={styles["result-list"]}>
          {results.map((result) => {
            return (
              <li key={result.cik}>
                <Link href={`/filers/${result.cik}`}>
                  <div className={styles["result"]}>
                    <span className={inter.className}>
                      {result.name.toUpperCase()} ({result.ticker})
                    </span>
                    <span className={inter.className}>CIK{result.cik}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      }
    </div>
  );
};

export default Search;
