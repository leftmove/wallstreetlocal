import styles from "./Reload.module.css";

import useEllipsis from "@/components/Hooks/useEllipsis";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "700" });

const Reload = () => {
  const { ellipsis } = useEllipsis();
  setTimeout(() => {
    window.location.reload();
  }, 15 * 1000);
  return (
    <div className={styles["reload"]}>
      <span className={[styles["reload-text"], inter.className].join(" ")}>
        Reloading Page Shortly {ellipsis}
      </span>
    </div>
  );
};

export default Reload;
