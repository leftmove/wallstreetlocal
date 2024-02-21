import styles from "./Explorer.module.css";
import { useEffect } from "react";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

import {
  selectTab,
  selectTimeline,
  setFilings,
  setAccess,
} from "@/redux/filerSlice";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";

import Timeline from "./Timeline/Timeline";

const server = process.env.NEXT_PUBLIC_SERVER;
const getFetcher = (url, cik) =>
  axios
    .get(url, {
      params: {
        cik,
      },
    })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const Explorer = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const tab = useSelector(selectTab);
  const timeline = useSelector(selectTimeline);

  const open = timeline.open;

  const {
    data,
    error,
    isLoading: loading,
  } = useSWR(
    cik ? [server + "/filers/filings", cik] : null,
    ([url, cik]) => getFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data) {
      const filings = data.filings;
      dispatch(setFilings(filings));
      if (timeline.access == "") {
        const firstFiling = filings[0];
        const accessNumber = firstFiling.access_number;
        dispatch(setAccess(accessNumber));
      }
    }
  }, [data]);

  if (tab != "historical") return null;

  return (
    <div className={styles["explorer-container"]}>
      <div
        className={[
          styles["explorer"],
          open ? styles["explorer-expanded"] : "",
        ].join(" ")}
      >
        <button className={styles["explorer-button"]}>
          <LeftIcon className={styles["explorer-icon"]} />
        </button>
        <Timeline />
        <button className={styles["explorer-button"]}>
          <RightIcon className={styles["explorer-icon"]} />
        </button>
      </div>
    </div>
  );
};

export default Explorer;
