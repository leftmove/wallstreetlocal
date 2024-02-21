import styles from "./Select.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectPrimary,
  selectSecondary,
  editComparison,
} from "@/redux/filerSlice";

import { font } from "@fonts";

import Headers from "@/components/Headers/Headers";

const server = process.env.NEXT_PUBLIC_SERVER;
const Select = (props) => {
  const dispatch = useDispatch();
  const type = props.type || "primary";
  const selected =
    type == "secondary"
      ? useSelector(selectSecondary)
      : useSelector(selectPrimary);
  const headers = selected.headers;

  const initialHeader = headers[0];
  const [description, setDescription] = useState({
    title: initialHeader.display,
    text: initialHeader.tooltip,
  });

  const updateHeaders = (h) =>
    dispatch(editComparison({ key: selected.access, headers: h }));
  const updateDescription = (d) => setDescription(d);
  const updateActivation = (a) =>
    dispatch(
      editComparison({
        key: selected.access,
        headers: headers.map((h) =>
          h.accessor === a ? { ...h, active: !h.active } : h
        ),
      })
    );
  const updateSold = () =>
    dispatch(
      editComparison({
        key: selected.access,
        sort: { ...selected.sort, sold: !selected.sort.sold },
      })
    );
  const updateNa = () =>
    dispatch(
      editComparison({
        key: selected.access,
        sort: { ...selected.sort, na: !selected.sort.na },
      })
    );

  const handleDownload = () => {
    window.open(
      server +
        "/filers/record/timeseries/?" +
        new URLSearchParams({ cik, time }),
      "_blank"
    );
  };

  return (
    <div className={styles["select"]}>
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
      <button
        className={[styles["select-download"], font.className].join(" ")}
        onClick={() => handleDownload()}
      >
        <span className={font.className}>Download</span>
      </button>
    </div>
  );
};

export default Select;
