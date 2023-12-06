import styles from "./Reload.module.css";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { fontLight } from "@fonts";

import useEllipsis from "@/components/Hooks/useEllipsis";

const Reload = (props) => {
  const router = useRouter();
  const { ellipsis } = useEllipsis();
  useEffect(() => {
    setTimeout(() => {
      router.replace(router.asPath);
    }, props.delay || 1000);
  }, []);

  return (
    <div className={styles["reload"]}>
      <span className={[styles["reload-text"], fontLight.className].join(" ")}>
        Reloading Page {ellipsis}
      </span>
    </div>
  );
};

export default Reload;
