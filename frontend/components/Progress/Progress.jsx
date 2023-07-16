import styles from "./Progress.module.css";
import { useEffect, useReducer, useRef, useState } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });
const interLight = Inter({ subsets: ["latin"], weight: "700" });

import useSWRSubscription from "swr/subscription";

import Recommended from "@/components/Recommended/Filer/Recommended";

const Progress = (props) => {
  const [host, setHost] = useState("localhost:3000");
  useEffect(() => {
    setHost(window.location.host);
  }, [host]);

  const [logs, pushLog] = useReducer(
    (prev, next) => [...prev, ...next],
    ["Initializing..."]
  );

  const ref = useRef(null);
  useEffect(() => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useSWRSubscription(
    `ws://${host}/api/filers/logs?cik=${props.cik}`,
    (key, { next }) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", ({ data }) => {
        pushLog(data.split("\n"));

        if (data.includes("Finished")) {
          return () => socket.close();
        }

        return next(null, data);
      });
      socket.addEventListener("error", (event) => next(event.error));
      socket.addEventListener("close", () => {
        setTimeout(() => {
          window.location.reload();
        }, 10 * 1000);
      });
      return () => socket.close();
    }
  );

  return (
    <>
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
      <Recommended />
    </>
  );
};

export default Progress;
