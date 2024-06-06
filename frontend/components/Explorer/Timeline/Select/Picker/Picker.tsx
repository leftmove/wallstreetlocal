 
import styles from "./Picker.module.css";
import selectStyles from "../Select.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectFilings,
  setComparison,
  setOpen,
} from "@/redux/filerSlice";
import { font, fontLight } from "components/fonts";

const server = process.env.NEXT_PUBLIC_SERVER;

interface PickerProps {
  selected: { type: string };
  attributes: { text: string; hint: string }[];
  picking: boolean;
  setPicking: (picking: boolean) => void;
}

interface Filing {
  access_number: string;
  report_date: number;
  filing_date: number;
  market_value?: number;
}

const Picker: React.FC<PickerProps> = (props) => {
  const { selected, attributes, picking, setPicking } = props;
  const cik = useSelector(selectCik);
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
        {filings.map((filing: Filing) => {
          const accessNumber = filing.access_number;
          const reportDate = new Date(
            filing.report_date * 1000
          ).toLocaleDateString();
          const filingDate = new Date(
            filing.filing_date * 1000
          ).toLocaleDateString();
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

          return (
            <div
              key={accessNumber}
              className={[styles["picker-filing"], fontLight.className].join(
                " "
              )}
            >
              <span
                className={styles["filing-attribute"]}
                onClick={() => handleClick()}
              >
                {accessNumber}
              </span>
              <span
                className={styles["filing-attribute"]}
                onClick={() => handleClick()}
              >
                {reportDate}
              </span>
              <span
                className={styles["filing-attribute"]}
                onClick={() => handleClick()}
              >
                {filingDate}
              </span>
              <span
                className={styles["filing-attribute"]}
                onClick={() => handleClick()}
              >
                {marketValue}
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={[
          selectStyles["picker-attributes"],
          styles["picker-attributes"],
        ].join(" ")}
      >
        {attributes.map((a) => (
          <div
            key={a.hint}
            className={[
              selectStyles["picker-attribute"],
              styles["picker-attribute"],
            ].join(" ")}
          >
            <button
              className={[
                selectStyles["attribute-button"],
                styles["attribute-button"],
              ].join(" ")}
              onClick={() => setPicking(!picking)}
            >
              <span
                className={[
                  selectStyles["attribute-text"],
                  styles["attribute-text"],
                  font.className,
                ].join(" ")}
              >
                {a.text}
              </span>
            </button>
            <span
              className={[
                selectStyles["attribute-hint"],
                styles["attribute-hint"],
                fontLight.className,
              ].join(" ")}
            >
              {a.hint}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Picker;
