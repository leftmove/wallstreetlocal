import styles from "./Progress.module.css";
import { useEffect, useReducer, useRef } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });
const interLight = Inter({ subsets: ["latin"], weight: "700" });

import { useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

// import useSWRSubscription from "swr/subscription";
import axios from "axios";

import { useInterval } from "@/components/Hooks/useInterval";

const Progress = (props) => {
  // const [host, setHost] = useState("localhost:3000");
  // useEffect(() => {
  //   setHost(window.location.host);
  // }, [host]);

  // const [logs, pushLog] = useReducer(
  //   (prev, next) => [...prev, ...next],
  //   ["Initializing..."]
  // );

  // useSWRSubscription(
  //   `ws://${host}https://content.wallstreetlocal.com/filers/logs?cik=${props.cik}`,
  //   (key, { next }) => {
  //     const socket = new WebSocket(key);
  //     socket.addEventListener("message", ({ data }) => {
  //       pushLog(data.split("\n"));

  //       if (data.includes("Finished")) {
  //         return () => socket.close();
  //       }

  //       return next(null, data);
  //     });
  //     socket.addEventListener("error", (event) => next(event.error));
  //     socket.addEventListener("close", () => {
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 10 * 1000);
  //     });
  //     return () => socket.close();
  //   }
  // );

  const [status, setStatus] = useReducer(
    (prev, next) => {
      const stop = next.stop;
      let delay = prev.delay;
      if (stop) {
        delay = null;
      }
      return { stop: stop, delay: delay };
    },
    { stop: false, delay: 10 * 1000 }
  );
  const [log, addLogs] = useReducer(
    (prev, next) => {
      if (next.length === 0) {
        return prev;
      }
      const logs = [...prev.logs, ...next];
      return {
        logs: logs,
        count: logs.length,
      };
    },
    { logs: ["Initializing..."], count: 0 }
  );
  const logs = log.logs;

  const ref = useRef(null);
  useEffect(() => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs]);
  useInterval(() => {
    axios
      .get("https://content.wallstreetlocal.com/filers/logs", {
        params: { cik: props.cik, start: log.count },
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.wait) {
          setTimeout(() => {}, 60 * 1000);
        }
        if (data.stop) {
          setStatus({ stop: true });
          throw Error("Logs done.");
        } else {
          return data.logs;
        }
      })
      .then((logs) => addLogs(logs))
      .catch((e) => console.error(e));
  }, status.delay);

  if (status.stop) {
    setTimeout(() => {
      window.location.reload();
    }, 15 * 1000);
  }

  return (
    <div className={[styles["progress"], inter.className].join(" ")}>
      <span className={styles["header"]}>Building Filer...</span>
      <div className={styles["logs"]}>
        {logs.map((log, index) => {
          return (
            <span
              key={index}
              className={[styles["log"], interLight.className].join(" ")}
            >
              {log}
            </span>
          );
        })}
        <div className={styles["bottom"]} ref={ref}></div>
      </div>
    </div>
  );
};

export default Progress;
