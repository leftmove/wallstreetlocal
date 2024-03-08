import styles from "../Pagination.module.css";
import { useEffect, useState } from "react";

import { font } from "@fonts";

const Count = (props) => {
  const pagination = props.pagination;
  const setOffset = (o) => props.skip(o);

  const totalPageCount = Math.ceil(pagination.count / pagination.limit);
  const realPageCount = Math.floor(pagination.offset / pagination.limit) + 1;
  const [focus, setFocus] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setPageCount(realPageCount);
  }, [realPageCount]);

  const handleBlur = () => {
    if (pageCount >= 1 && pageCount <= totalPageCount) {
      const offset = (pageCount - 1) * pagination.limit;
      setOffset(offset);
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
