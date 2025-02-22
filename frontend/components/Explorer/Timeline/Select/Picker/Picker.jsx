import styles from "./Picker.module.css";

import { useDispatch, useSelector } from "react-redux";
import { selectFilings, setComparison } from "@/redux/filerSlice";

import { fontLight } from "components/fonts";

const Picker = (props) => {
  const selected = props.selected;
  const attributes = props.attributes;
  const picking = props.picking;
  const setPicking = () => props.setPicking();

  const filings = useSelector(selectFilings);
  const dispatch = useDispatch();

  return (
    <div
      className={[
        styles["picker"],
        picking ? styles["picker-present"] : styles["picker-dissappear"],
      ].join(" ")}
    >
      <div className={styles["picker-filings"]}>
        {filings.map((filing, i) => {
          const accessNumber = filing.access_number;
          const reportDate = new Date(
            filing.report_date * 1000
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const filingDate = new Date(
            filing.filing_date * 1000
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const marketValue = filing.market_value
            ? new Intl.NumberFormat("en-US").format(filing.market_value)
            : "-";

          const handleClick = () => {
            dispatch(
              setComparison({
                type: selected.type,
                access: accessNumber,
              })
            );
            setPicking(false);
          };

          const filingAttributes = [
            reportDate,
            filingDate,
            accessNumber,
            marketValue,
          ];
          return (
            <div
              key={[
                i,
                accessNumber,
                selected.type,
                reportDate,
                filingDate,
                marketValue,
              ].join("-")}
              className={[styles["picker-filing"], fontLight.className].join(
                " "
              )}
              onClick={() => handleClick()}
            >
              {filingAttributes.map((a) => (
                <span key={a} className={styles["filing-attribute"]}>
                  {a}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Picker;
