import styles from "./Search.module.css";
import { useEffect, useReducer, useinput, useRef } from "react";

import { useRouter } from "next/router";

import axios from "axios";
import useSWR from "swr";

import Link from "next/link";

import { font, fontLight } from "@fonts";
import { cn } from "components/ui/utils";

const server = process.env.NEXT_PUBLIC_SERVER;
const fetcher = (url, query, limit) =>
  axios
    .get(url, { params: { q: query, limit } })
    .then((res) => res.data)
    .catch((e) => console.error(e));

const Input = ({ input, setInput, inputRef, className }) => {
  const handleChange = (e) => {
    setInput({ search: e.target.value });
  };
  const handleFocus = () => {
    setInput({ focus: true });
  };
  const handleBlur = () => {
    setInput({ focus: false });
  };
  const handleKey = (e) => {
    const hover = input.results.find((result) => result.hover);
    const pos = input.results.findIndex((result) => result.hover);
    switch (e.key) {
      case "Escape":
        setInput({ focus: false });
        inputRef.current.blur();
        break;
      case "Enter":
        router.push(`/filers/${hover.cik}`);
        break;
      case "ArrowDown":
        const after = pos === input.results.length - 1 ? 0 : pos + 1;
        setInput({
          results: input.results.map((result, i) =>
            i === after
              ? { ...result, hover: true }
              : { ...result, hover: false }
          ),
        });
        break;
      case "ArrowUp":
        const before = pos === 0 ? input.results.length - 1 : pos - 1;
        setInput({
          results: input.results.map((result, i) =>
            i === before
              ? { ...result, hover: true }
              : { ...result, hover: false }
          ),
        });
        break;
      default:
        break;
    }
  };
  return (
    <div className={cn(styles["search-box"], className)}>
      <input
        type="text"
        ref={inputRef}
        className={[styles["search-input"]].join(" ")}
        value={input.search}
        placeholder={input.focus ? "" : "Search..."}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKey}
      />
    </div>
  );
};

const Results = ({ input, setInput, className }) => {
  const handleMouseEnter = (cik) => {
    setInput({
      results: input.results.map((result) =>
        result.cik === cik
          ? { ...result, hover: true }
          : { ...result, hover: false }
      ),
    });
  };
  const handleMouseLeave = (cik) => {
    setInput({
      results: input.results.map((result) =>
        result.cik === cik
          ? { ...result, hover: false }
          : { ...result, hover: false }
      ),
    });
  };
  return (
    <div
      className={[
        styles["results"],
        input.focus && input.search.length ? styles["results-expand"] : "",
        className,
      ].join(" ")}
    >
      {
        <ul className={styles["result-list"]}>
          {input.results.map((result) => {
            return (
              <li key={result.cik}>
                <Link href={`/filers/${result.cik}`}>
                  <div
                    className={cn(
                      styles["result"],
                      "hover:bg-white-two",
                      result.hover && "bg-white-two"
                    )}
                    onMouseEnter={() => handleMouseEnter(result.cik)}
                    onMouseLeave={() => handleMouseLeave(result.cik)}
                  >
                    <span className="font-semibold">
                      {result.name.toUpperCase()}{" "}
                      {result.tickers.length == 0
                        ? ""
                        : `(${result.tickers.join(", ")})`}
                    </span>
                    <span className="font-semibold ">
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
  );
};

const Search = (props) => {
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
  const inputRef = useRef(null);
  // const input = props.state;
  // const setInput = props.dispatch;

  const limit = 5;
  const { data } = useSWR(
    input.search ? [server + "/filers/search", input.search, limit] : null,
    ([url, query, limit]) => fetcher(url, query, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const handleSearch = (data) => {
    if (data) {
      setInput({ results: data.results });
    } else {
      setInput({ results: [] });
    }
  };

  useEffect(() => {
    handleSearch(data);
  }, [data]);

  return (
    <div
      className={[
        styles["search"],
        input.focus ? styles["search-expand"] : "",
        props.className,
      ].join(" ")}
    >
      <Input
        input={input}
        setInput={(...args) => setInput(...args)}
        inputRef={inputRef}
      />
      <Results input={input} setInput={(...args) => setInput(...args)} />
    </div>
  );
};

export default Search;
