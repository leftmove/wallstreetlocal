import { React } from "react";
import styles from "./SortButton.module.css";
import SortIcon from "./sort.svg";

import { useDispatch, useSelector } from "react-redux";
import { sortHeader, selectSort } from "@/redux/features/stockSlice";

const SortButton = (props) => {
  const accessor = props.accessor;

  const select = useSelector(selectSort);
  const sort = select.sort;
  const reverse = select.reverse;
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => {
        dispatch(
          sortHeader({
            sort: accessor,
            reverse: !reverse,
          })
        );
      }}
      className={[
        styles["button"],
        sort === accessor && reverse ? "" : styles["button-reverse"],
        sort === accessor ? styles["button-click"] : "",
      ].join(" ")}
    >
      <SortIcon className={[styles["button-image"]].join(" ")} />
    </button>
  );
};

export default SortButton;
