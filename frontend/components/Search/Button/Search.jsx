import styles from "./Search.module.css";
import { useEffect, useState, useRef, useReducer } from "react";

import axios from "axios";
import useSWR from "swr";

import Link from "next/link";
import { font } from "@fonts";

import Input from "../Homepage/Search";
import Results from "../Homepage/Search";
import SearchIcon from "@/public/static/search.svg";

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
      results: [],
      search: "",
      focus: false,
    }
  );
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  const limit = 10;
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

  return (
    <>
      <button
        className={[
          "h-full",
          styles["search-button"],
          show ? styles["search-show"] : "",
        ].join(" ")}
        onClick={() => setShow(true)}
      >
        <SearchIcon className={styles["search-svg"]} />
      </button>
      {show ? (
        <>
          <div
            className={styles["search-background"]}
            onClick={() => setShow(false)}
          />
          <Input
            input={input}
            setInput={(...args) => setInput(...args)}
            inputRef={inputRef}
            className="z-[1500]"
          />
          <Results
            input={input}
            setInput={(...args) => setInput(...args)}
            className="z-[1500]"
          />
        </>
      ) : null}
    </>
  );

  // return (
  //   <div
  //     className={[
  //       styles["search"],
  //       isFocused ? styles["search-expand"] : "",
  //     ].join(" ")}
  //   >
  //     <div className={styles["search-box"]}>
  //       <input
  //         type="text"
  //         className={[styles["search-input"], font.className].join(" ")}
  //         value={searchInput}
  //         placeholder={isFocused ? "" : "Search..."}
  //         onChange={(e) => setSearchInput(e.target.value)}
  //         onFocus={() => setIsFocused(true)}
  //         onBlur={() => setIsFocused(false)}
  //       />
  //     </div>
  //     <div className={[styles["results"]].join(" ")}>
  //       {
  //         <ul className={styles["result-list"]}>
  //           {results.map((result) => {
  //             return (
  //               <li key={result.cik}>
  //                 <Link href={`/filers/${result.cik}`}>
  //                   <div className={styles["result"]}>
  //                     <span className={font.className}>
  //                       {result.name.toUpperCase()}{" "}
  //                       {result.tickers.length == 0
  //                         ? ""
  //                         : `(${result.tickers.join(", ")})`}
  //                     </span>
  //                     <span className={font.className}>
  //                       CIK{result.cik.padStart(10, "0")}
  //                     </span>
  //                   </div>
  //                 </Link>
  //               </li>
  //             );
  //           })}
  //         </ul>
  //       }
  //     </div>
  //   </div>
  // );
};

export default Search;
