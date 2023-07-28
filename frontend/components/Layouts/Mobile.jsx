import styles from "@/styles/Mobile.module.css";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

export default function MobileLayout() {
  return (
    <div className={styles.fill}>
      <span className={inter.className}>
        wallstreetlocal is not available on mobile just yet.
      </span>
    </div>
  );
}
