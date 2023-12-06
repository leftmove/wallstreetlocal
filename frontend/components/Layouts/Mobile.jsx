import styles from "@/styles/Fill.module.css";

import { font } from "@fonts";

export default function MobileLayout() {
  return (
    <div className={styles.fill}>
      <span className={font.className}>
        wallstreetlocal is not available on mobile just yet.
      </span>
    </div>
  );
}
