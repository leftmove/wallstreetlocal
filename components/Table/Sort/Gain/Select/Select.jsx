import styles from "./Select.module.css";
import { useState } from "react";

import Picker from "./Picker/Picker";

const Select = (props) => {
  const date = props.date;
  const display = date.dispaly;

  return (
    <div className={styles["date"]}>
      <Picker display={display} />
    </div>
  );
};

export default Select;
