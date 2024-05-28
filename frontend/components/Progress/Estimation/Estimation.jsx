import styles from "./Estimation.module.css";

import { useEffect, useState } from "react";

import axios from "axios";
import useSWR from "swr";

import { fontLight } from "@fonts";

import useEllipsis from "components/Hooks/useEllipsis";
import useInterval from "components/Hooks/useInterval";

const fetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => r.data)
    .catch((e) => console.log(e));

const secondsToDhms = (seconds) => {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? " Day, " : " Days, ") : "";
  const hDisplay = h > 0 ? h + (h == 1 ? " Hour, " : " Hours, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " Minute, " : " Minutes, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " Second" : " Seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

const server = process.env.NEXT_PUBLIC_SERVER;
const Estimation = (props) => {
  const cik = props.cik;
  const {
    data,
    error,
    isLoading: loading,
  } = useSWR(
    [server + "/filers/estimate", cik],
    ([url, cik]) => fetcher(url, cik),
    {
      refreshInterval: 10000,
    }
  );
  const [time, setTime] = useState({
    confirmed: 0,
    estimated: 0,
    status: 2,
  });

  const { ellipsis } = useEllipsis();

  useInterval(() => {
    setTime({ ...time, estimated: time.estimated - 1 });
  }, 1000);
  useEffect(() => {
    if (data) {
      const estimation = data?.time;
      const status = data?.status;
      const newEstimation = {
        ...time,
        status,
      };

      if (estimation !== time.confirmed) {
        newEstimation.confirmed = newEstimation.estimated = estimation;
      }

      setTime(newEstimation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading || time.status > 0) {
    return (
      <div className={styles["estimation"]}>
        <span
          className={[styles["estimation-text"], fontLight.className].join(" ")}
        >
          Estimating Time Remaining {ellipsis}
        </span>
      </div>
    );
  }

  // if (time <= 0) {
  //   return (
  //     <div className={styles["estimation"]}>
  //       <span
  //         className={[styles["estimation-text"], fontLight.className].join(" ")}
  //       >
  //         Finishing Up {ellipsis}
  //       </span>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className={styles["estimation"]}>
        <span
          className={[styles["estimation-text"], fontLight.className].join(" ")}
        >
          Failed to estimate time remaining.
        </span>
      </div>
    );
  }

  const timeReadable = secondsToDhms(time.estimated);
  return (
    <div className={styles["estimation"]}>
      <span
        className={[styles["estimation-text"], fontLight.className].join(" ")}
      >
        {timeReadable} {ellipsis}
      </span>
    </div>
  );
};

export default Estimation;
