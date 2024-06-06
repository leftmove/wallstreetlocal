import styles from "@/styles/Fill.module.css";

import { font } from "@fonts";

import React from "react";

export default function MobileLayout(): JSX.Element {
  return (
    <div className={styles.fill}>
      <span className={font.className}>
        wallstreetlocal is not available on mobile just yet.
      </span>
    </div>
  );
}