import styles from "./Progress.module.css";
import { useEffect, useReducer, useState } from "react";

import { font } from "@fonts";

import axios from "axios";
import useSWR from "swr";

import Redirect from "components/Filer/Redirect";
import Source from "components/Source/Source";
import Estimation from "./Estimation/Estimation";
import Console from "./Console/Console";

const server = process.env.NEXT_PUBLIC_SERVER;

interface LogFetcherResponse {
  data: any;
  status: number;
  logs?: string[];
}

const logFetcher = (url: string, cik: string, start: number): Promise<LogFetcherResponse> =>
  axios
    .get(url, {
      params: { cik: cik, start: start },
    })
    .then((res) => {
      return { ...res.data, status: res.status };
    })
    .then((data) => data)
    .catch((e) => {
      const status = e.response.status;
      const error = new Error(e.data.message);

      (error as any).status = status;
      throw error;
    });

interface ProgressProps {
  cik: string;
  name?: string;
  persist?: boolean;
}

interface LogState {
  logs: string[];
  count: number;
  wait: boolean;
}

const Progress: React.FC<ProgressProps> = (props) => {
  const cik = props.cik;
  const name = props.name || null;
  const persist = props.persist || false;
  const [log, addLogs] = useReducer(
    (prev: LogState, next: string[]) => {
      if (next.length === 0) {
        return prev;
      }

      const logs = [...prev.logs, ...next];
      const length = logs.length;
      if (length > 100) {
        logs.shift();
      }
      return {
        logs: logs,
        count: logs.length,
        wait: false,
      };
    },
    { logs: ["Initializing, this may take a while..."], count: 0, wait: false }
  );
  const [wait, setWait] = useState(false);
  const [stop, setStop] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
  } = useSWR(
    wait || stop ? null : [server + "/filers/logs", cik, log.count],
    ([url, cik, start]) => logFetcher(url, cik, start),
    { refreshInterval: 10 * 1000 }
  );

  useEffect(() => {
    if (data) {
      switch (data.status) {
        case 200:
          addLogs(data.logs || []);

          if (persist == false) {
            addLogs(["Filer finished initial load, reloading the page."]);
            setTimeout(() => {
              setStop(true);
            }, 5 * 1000);
          }

          break;
        case 201:
          addLogs(data.logs || []);
          addLogs(["Filer finished up, reloading the page."]);
          setStop(true);
        case 202:
          addLogs(data.logs || []);
          break;
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      switch ((error as any).status) {
        case 503:
          setWait(true);
          setTimeout(() => {
            setWait(false), 15 * 1000;
          });
          break;
        case 404:
          addLogs(["Logs not found, try reloading the page."]);
          break;
      }
    }
  }, [error]);

  return (
    <>
      {stop ? <Redirect cik={cik} delay={0} /> : null}
      <div className={[styles["progress"], font.className].join(" ")}>
        <div className={styles["header"]}>
          <div className={styles["main-header"]}>
            <span>Building Filer</span>
            <Source cik={cik} width="30px" />
          </div>
          <div className={styles["sub-header"]}>
            {name ? <span>{name}</span> : null}
          </div>
        </div>
        <Console loading={loading} logs={log.logs} />
      </div>
      {/* <span>View stocks continuously.</span> */}
      {/*persist ? null : <Estimation cik={cik} /> */}
    </>
  );
};

export default Progress;