import styles from "./Date.module.css";
import { useState } from "react";

import Picker from "./Picker/Picker";

const Date = (props) => {
  const dateProperties = props.date;
  const [date, setDate] = useState(new Date());

  return (
    <div className={styles["date"]}>
      <Picker />
      {/* <DatePicker
        selected={date}
        onChange={(date) => setDate(date)}
        dateFormat="MM/yyyy"
        wrapperClassName={styles["date-picker"]}
        showMonthYearPicker
      /> */}
    </div>
  );
};

export default Date;
