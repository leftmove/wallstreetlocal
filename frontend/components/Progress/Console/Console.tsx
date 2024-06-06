import styles from "../Progress.module.css";
import { useEffect, useRef } from "react";
import { fontLight } from "@fonts";
import useEllipsis from "components/Hooks/useEllipsis";
import Loading from "components/Loading/Loading";

interface ConsoleProps {
  logs: string[];
  stall?: boolean;
  loading?: boolean;
}

const Console: React.FC<ConsoleProps> = (props) => {
  const logs = props.logs;
  const stall = props.stall || true;
  const loading = props.loading || false;

  const { ellipsis } = useEllipsis();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs]);

  return (
    <div className={styles["logs"]}>
      {loading ? <Loading /> : null}
      {logs.map((log, index) => {
        return (
          <span
            key={index}
            className={[styles["log"], fontLight.className].join(" ")}
          >
            {log}
          </span>
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