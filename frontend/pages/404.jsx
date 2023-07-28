import styles from "@/styles/Fill.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

export default function MobileLayout() {
  return (
    <div className={styles.fill}>
      <span className={[styles["header"], inter.className].join(" ")}>404</span>
      <span className={[styles["desc"], inter.className].join(" ")}>
        Page not found.
      </span>
    </div>
  );
}
