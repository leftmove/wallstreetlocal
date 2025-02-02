import styles from "../Progress.module.css";
import { useEffect, useReducer, useRef } from "react";

import { fontLight } from "fonts";
import { cn } from "components/ui/utils";

import useEllipsis from "components/Hooks/useEllipsis";
import Loading from "components/Loading/Loading";

const Console = (props) => {
  const logs = props.logs;
  const stall = props.stall || true;
  const loading = props.loading || false;

  // Janky way of timing logs
  const [cache, cacheLog] = useReducer((prev, next) => {
    if (prev[next]) {
      return prev;
    }
    return { ...prev, [next]: new Date().toLocaleTimeString() };
  }, {});

  const { ellipsis } = useEllipsis();
  const ref = useRef(null);
  useEffect(() => {
    logs.forEach((log) => cacheLog(log));
    ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs]);

  return (
    <div className={cn(styles["logs"], "bg-black-one p-4")}>
      {loading ? <Loading /> : null}
      {logs.map((log, index) => {
        return (
          <div className="flex items-center justify-between" key={index}>
            <span className="hidden text-white-one md:block text-nowrap">
              {cache[log]}
            </span>
            <span
              className={[
                styles["log"],
                "text-nowrap",
                fontLight.className,
              ].join(" ")}
            >
              {log}
            </span>
          </div>
        );
      })}
      <span className={[styles["log"], fontLight.className].join(" ")}>
        {stall ? null : ellipsis}
      </span>
      <div className={styles["bottom"]} ref={ref}></div>
    </div>
  );
};

export default Console;
