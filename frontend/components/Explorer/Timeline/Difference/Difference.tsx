import styles from "../Select/Select.module.css";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  selectPrimary,
  selectSecondary,
  selectDifference,
  editComparison,
  editDifference,
} from "@/redux/filerSlice";

import { font, fontLight } from "components/fonts";

import Headers from "components/Headers/Headers";
import Record from "../Select/Record/Record";

interface DifferenceProps {
  setDescription: (description: string) => void;
}

interface Header {
  accessor: string;
  active: boolean;
}

interface Sort {
  sold: boolean;
  na: boolean;
}

interface DifferenceState {
  headers: Header[];
  sort: Sort;
}

const Difference: React.FC<DifferenceProps> = (props) => {
  const dispatch = useDispatch();
  const difference: DifferenceState = useSelector(selectDifference);
  const headers = difference.headers;

  const updateHeaders = (h: Header[]) => dispatch(editDifference({ headers: h }));
  const updateDescription = (d: string) => props.setDescription(d);
  const updateActivation = (a: string) =>
    dispatch(
      editDifference({
        headers: headers.map((h) =>
          h.accessor === a ? { ...h, active: !h.active } : h
        ),
      })
    );
  const updateSold = () =>
    dispatch(
      editDifference({
        sort: { ...difference.sort, sold: !difference.sort.sold },
      })
    );
  const updateNa = () =>
    dispatch(
      editDifference({
        sort: { ...difference.sort, na: !difference.sort.na },
      })
    );

  return (
    <div className={styles["select-container"]}>
      <div className={styles["select"]}>
        <div className={styles["select-headers"]}>
          <Headers
            headers={headers}
            sold={difference.sort.sold}
            na={difference.sort.na}
            updateDescription={updateDescription}
            updateActivation={updateActivation}
            updateHeaders={updateHeaders}
            updateSold={updateSold}
            updateNa={updateNa}
          />
        </div>
        <div className={styles["select-records"]}>
          <Record variant="json" />
          <Record variant="csv" headers={headers} />
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

export default Difference;