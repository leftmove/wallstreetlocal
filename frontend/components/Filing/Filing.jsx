import styles from "@/styles/Filer.module.css";

import { useSelector } from "react-redux";
import { selectCik, selectMain } from "@/redux/filerSlice";

import { font, fontLight } from "fonts";
import { cn } from "components/ui/utils";

const Filing = (props) => {
  const cik = props.cik;
  const an = props.an;
  const filing = useSelector(selectMain);

  const access = filing.access || "";
  const value = filing.value || null;
  const report = new Date(filing.report.date);
  const filed = new Date(filing.filing.date);

  return (
    <main className={cn("font-switzer", styles["holding-header"])}>
      <h1 className="text-5xl font-bold text-black-one">Holdings Summary</h1>
      <h2 className="mt-2 text-2xl font-semibold text-black-one">
        {report.toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </h2>
      <span
        className={["mt-4 font-medium", styles["holding-access"]].join(" ")}
      >
        {access}
      </span>
      <span className={["font-medium", styles["holding-value"]].join(" ")}>
        ${value}
      </span>
    </main>
  );
};

export default Filing;
