import styles from "./Pagination.module.css";

import { setOffset, selectPagination } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import RightIcon from "@/public/static/right.svg";
import LeftIcon from "@/public/static/left.svg";

import Count from "./Count/Count";
import Limit from "./Limit/Limit";

const Pagination = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectPagination);

  const leftOffset = Number(pagination.offset - pagination.limit);
  const rightOffset = Number(pagination.offset + pagination.limit);

  return pagination.count > 0 ? (
    <div className={styles["pagination"]}>
      <button
        className={styles["pagination-button"]}
        onClick={() =>
          leftOffset <= 0 ? dispatch(setOffset(leftOffset)) : null
        }
      >
        <RightIcon className={styles["pagination-icon"]} />
      </button>
      <Count />
      <Limit />
      <button
        className={styles["pagination-button"]}
        onClick={() =>
          rightOffset <= pagination.count
            ? dispatch(setOffset(rightOffset))
            : null
        }
      >
        <LeftIcon className={styles["pagination-icon"]} />
      </button>
    </div>
  ) : null;
};

export default Pagination;
