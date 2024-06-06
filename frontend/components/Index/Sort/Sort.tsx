import { useState } from "react";
import styles from "./Sort.module.css";

import Filter from "./Filter/Filter";
import Gain from "./Gain/Gain";
import Record from "./Record/Record";
import Tip from "components/Tip/Tip";

interface RecordProps {
  variant: RecordVariant;
}

enum RecordVariant {
  JSON = "json",
  CSV = "csv",
}

const Sort: React.FC = () => {
  return (
    <>
      <Filter />
      <Gain />
      <div className={styles["sort-records"]}>
        <div className={styles["sort-downloads"]}>
          <Record variant={RecordVariant.JSON} />
          <Record variant={RecordVariant.CSV} />
        </div>
        <Tip text="Downloads for bulk data." />
      </div>
    </>
  );
};

export default Sort;