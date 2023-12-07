import styles from "../Pagination.module.css";
import { useState } from "react";

import { setOffset, selectPagination } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import { font } from "@fonts";

const Count = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectPagination);

  const totalPageCount = Math.ceil(pagination.count / pagination.limit);
  const realPageCount = pagination.offset / pagination.limit + 1;
  const [focus, setFocus] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const handleBlur = () => {
    if (pageCount >= 1 && pageCount <= totalPageCount) {
      const offset = (pageCount - 1) * pagination.limit;
      dispatch(setOffset(offset));
    }
    setFocus(false);
  };
  const handleChange = (e) =>
    isNaN(e.target.value) ? null : setPageCount(Number(e.target.value));

  return (
    <div className={styles["pagination-display"]}>
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        Page
      </span>
      <input
        className={[styles["pagination-input"], font.className].join(" ")}
        onFocus={() => setFocus(true)}
        onBlur={() => handleBlur()}
        onChange={(e) => handleChange(e)}
        type="text"
        value={focus ? pageCount : realPageCount}
        onKeyDown={(e) => (e.key === "Enter" ? e.target.blur() : null)}
      />
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        of {totalPageCount}
      </span>
    </div>
  );
};

export default Count;
