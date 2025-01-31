import styles from "./Select.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectPrimary,
  selectSecondary,
  selectMain,
  editComparison,
} from "@/redux/filerSlice";

import { font, fontLight } from "fonts";
import { cn } from "components/ui/utils";

import Headers from "components/Headers/Headers";
import Record from "./Record/Record";
import Picker from "./Picker/Picker";
import Source from "components/Source/Source";
import Share from "components/Share/Share";

const Select = (props) => {
  const dispatch = useDispatch();
  const type = props.type;
  const cik = useSelector(selectCik);
  const selected = useSelector(
    (() => {
      switch (type) {
        case "primary":
          return selectPrimary;
        case "secondary":
          return selectSecondary;
        case "main":
          return selectMain;
        default:
          return selectPrimary;
      }
    })()
  );
  const headers = selected.headers;

  const updateHeaders = (h) => dispatch(editComparison({ type, headers: h }));
  const updateDescription = (d) => props.setDescription(d);
  const updateActivation = (a) =>
    dispatch(
      editComparison({
        type,
        headers: headers.map((h) =>
          h.accessor === a ? { ...h, active: !h.active } : h
        ),
      })
    );
  const updateSold = () =>
    dispatch(
      editComparison({
        type,
        sort: { ...selected.sort, sold: !selected.sort.sold },
      })
    );
  const updateNa = () =>
    dispatch(
      editComparison({
        type,
        sort: { ...selected.sort, na: !selected.sort.na },
      })
    );

  const [picking, setPicking] = useState(false);
  const attributes = [
    {
      text: new Date(selected?.report?.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      hint: "Report Date",
    },
    {
      text: new Date(selected?.filing?.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      hint: "Filing Date",
    },
    { text: selected.access, hint: "Access Number" },
    { text: selected.value, hint: "Market Value" },
  ];

  return (
    <div
      className={cn(
        styles["select-container"],
        "font-switzer w-full",
        props.className
      )}
    >
      <div className={styles["select-background"]}></div>
      <Picker
        selected={selected}
        attributes={attributes}
        setPicking={setPicking}
        picking={picking}
      />
      <div className={styles["select"]}>
        {/* <h2 className="w-full mb-2 text-lg font-semibold">Headers</h2> */}
        <div className={cn(styles["select-headers"], "")}>
          <Headers
            headers={headers}
            sold={selected.sort.sold}
            na={selected.sort.na}
            updateDescription={updateDescription}
            updateActivation={updateActivation}
            updateHeaders={updateHeaders}
            updateSold={updateSold}
            updateNa={updateNa}
          />
        </div>
        <div className="w-full mt-4">
          {/* <h2 className="w-full mb-2 text-lg font-semibold">Exports</h2> */}
          <div className={cn(styles["select-records"], "justify-between")}>
            <div className="flex items-center">
              <Record selected={selected} variant="json" />
              <Record selected={selected} variant="csv" headers={headers} />
            </div>
            <div className="flex items-center">
              <Source
                link={`https://www.sec.gov/Archives/edgar/data/${cik}/${selected?.access.replace(
                  "-",
                  ""
                )}/${selected?.access}-index.htm`}
                width={"20px"}
              />
              <Share width={"20px"} marginLeft={"5px"} />
            </div>
          </div>
        </div>
        <div className={cn(styles["picker-attributes"], "mt-10")}>
          {attributes.map((a) => (
            <div className={styles["picker-attribute"]} key={a.hint}>
              <button
                className={styles["attribute-button"]}
                onClick={() => setPicking(!picking)}
              >
                <span
                  className={[
                    styles["attribute-text"],
                    font.className,
                    "text-lg",
                  ].join(" ")}
                >
                  {a.text}
                </span>
              </button>
              <span
                className={[
                  styles["attribute-hint"],
                  fontLight.className,
                  "text-xs",
                ].join(" ")}
              >
                {a.hint}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Select;
