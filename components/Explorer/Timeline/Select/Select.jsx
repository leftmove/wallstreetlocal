import styles from "./Select.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectPrimary,
  selectSecondary,
  editComparison,
} from "@/redux/filerSlice";

import { font, fontLight } from "components/fonts";

import Headers from "components/Headers/Headers";
import Record from "./Record/Record";
import Picker from "./Picker/Picker";
import Source from "components/Source/Source";

const Select = (props) => {
  const dispatch = useDispatch();
  const type = props.type;
  const cik = useSelector(selectCik);
  const selected =
    type === "secondary"
      ? useSelector(selectSecondary)
      : useSelector(selectPrimary);
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
    { text: selected.access, hint: "Access Number" },
    { text: selected?.report?.date, hint: "Report Date" },
    { text: selected?.filing?.date, hint: "Filing Date" },
    { text: selected.value, hint: "Market Value" },
  ];

  return (
    <div className={styles["select-container"]}>
      <Picker
        selected={selected}
        attributes={attributes}
        setPicking={setPicking}
        picking={picking}
      />
      <div className={styles["select"]}>
        <div className={styles["select-headers"]}>
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
        <div className={styles["select-records"]}>
          <Record selected={selected} variant="json" />
          <Record selected={selected} variant="csv" headers={headers} />
          <Source
            link={`https://www.sec.gov/Archives/edgar/data/${cik}/${selected?.access.replace(
              "-",
              ""
            )}/${selected?.access}-index.htm`}
            color="light"
            width={"40px"}
          />
        </div>
        <div className={styles["picker-attributes"]}>
          {attributes.map((a) => (
            <div
              className={styles["picker-attribute"]}
              key={a.text + selected?.access}
            >
              <button
                className={styles["attribute-button"]}
                onClick={() => setPicking(!picking)}
              >
                <span
                  className={[styles["attribute-text"], font.className].join(
                    " "
                  )}
                >
                  {a.text}
                </span>
              </button>
              <span
                className={[styles["attribute-hint"], fontLight.className].join(
                  " "
                )}
              >
                {a.hint}
              </span>
            </div>
          ))}
        </div>
        {/* <Picker
          variant="stable"
          selected={selected}
          setPicking={(pickingState) => setPicking(pickingState)}
          picking={picking}
        /> */}
      </div>
    </div>
  );
};

export default Select;
