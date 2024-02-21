import styles from "./Explorer.module.css";
import { useEffect } from "react";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectTab,
  selectPrimary,
  setFilings,
  selectTimeline,
  setPrimary,
  setSecondary,
  selectSecondary,
} from "@/redux/filerSlice";

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
  const primary = useSelector(selectPrimary);

  const open = timeline.open;
  const access = primary.access;

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
      if (access == "") {
        const firstFiling = filings[0];
        const secondFiling = filings[1];
        const firstAccess = firstFiling.access_number;
        const secondAccess = secondFiling.access_number;
        dispatch(setPrimary({ access: firstAccess }));
        dispatch(setSecondary({ access: secondAccess }));
      }
    }
  }, [data]);

  if (tab != "historical") return null;

  return (
    <div className={styles["explorer-container"]}>
      <Timeline />
    </div>
  );
};

export default Explorer;
