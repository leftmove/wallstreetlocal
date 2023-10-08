import styles from "./Reload.module.css";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "700" });

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
      <span className={[styles["reload-text"], inter.className].join(" ")}>
        Reloading Page {ellipsis}
      </span>
    </div>
  );
};

export default Reload;
