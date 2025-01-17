import styles from "@/styles/Filer.module.css";

import { useSelector } from "react-redux";
import { selectCik, selectMain } from "@/redux/filerSlice";

import { font, fontLight } from "@fonts";

const Filing = (props) => {
  const cik = props.cik;
  const an = props.an;
  const filing = useSelector(selectMain);

  const access = filing.access || "";
  const value = filing.value || null;
  const report = new Date(filing.report.date);
  const filed = new Date(filing.filing.date);

  return (
    <main className={styles["holding-header"]}>
      <h1 className={font.className}>
        Holdings for{" "}
        <span className={styles["holding-date"]}>
          {report.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </h1>
      <span
        className={[fontLight.className, styles["holding-access"]].join(" ")}
      >
        {access}
      </span>
      <span
        className={[fontLight.className, styles["holding-value"]].join(" ")}
      >
        ${value}
      </span>
    </main>
  );
};

export default Filing;
