import styles from "./Search.module.css";
import { useEffect, useState, useRef, useReducer } from "react";

import axios from "axios";
import useSWR from "swr";

import Link from "next/link";
import { font } from "@fonts";

import SearchIcon from "@/public/static/search.svg";

const server = process.env.NEXT_PUBLIC_SERVER;

type Result = {
  cik: string;
  name: string;
  tickers: string[];
};

type InputState = {
  results: Result[];
  search: string;
  focus: boolean;
};

const fetcher = (url: string, query: string, limit: number) =>
  axios
    .get(url, { params: { q: query, limit } })
    .then((res) => res.data)
    .catch((e) => console.error(e));

const Search = () => {
  const [input, setInput] = useReducer(
    (prev: InputState, next: Partial<InputState>) => {
      return { ...prev, ...next };
    },
    {
      results: [],
      search: "",
      focus: false,
    }
  );
  const [show, setShow] = useState(false);

  const limit = 10;
  const { data } = useSWR(
    input.search ? [server + "/filers/search", input.search, limit] : null,
    ([url, query, limit]: [string, string, number]) => fetcher(url, query, limit),
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
          <div className={styles["search"]}>
            <input
              type="text"
              className={[styles["search-input"], font.className].join(" ")}
              value={input.search}
              placeholder={input.focus ? "" : "Start Typing..."}
              onChange={(e) => setInput({ search: e.target.value })}
              onFocus={() => setInput({ focus: true })}
              onBlur={() => setInput({ focus: false })}
              autoFocus
            />
          </div>
          {input.search && input.results.length ? (
            <ul className={styles["result-list"]}>
              {input.results.map((result) => {
                return (
                  <li key={result.cik}>
                    <Link
                      href={`/filers/${result.cik}`}
                      onClick={() => setShow(false)}
                    >
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
          ) : null}
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