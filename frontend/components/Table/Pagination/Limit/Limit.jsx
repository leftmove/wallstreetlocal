import styles from "../Pagination.module.css";
import { useEffect, useState } from "react";

import { font } from "@fonts";

const Limit = (props) => {
  const pagination = props.pagination;
  const setPagination = (p) => props.paginate(p);

  const [focus, setFocus] = useState(false);
  const [paginationLimit, setPaginationLimit] = useState(100);

  useEffect(() => {
    if (pagination.count <= 100) {
      setPaginationLimit(pagination.count);
      setPagination(pagination.count);
      setFocus(false);
    }
  }, []);

  const handleBlur = () => {
    if (paginationLimit > 0) {
      setPagination(paginationLimit);
    }
    setFocus(false);
  };
  const handleChange = (e) =>
    isNaN(e.target.value) ? null : setPaginationLimit(Number(e.target.value));

  return (
    <div className={styles["pagination-display"]}>
      <input
        className={[styles["pagination-input"], font.className].join(" ")}
        onFocus={() => setFocus(true)}
        onBlur={() => handleBlur()}
        onChange={(e) => handleChange(e)}
        type="text"
        value={
          focus ? paginationLimit : Math.min(pagination.limit, pagination.count)
        }
        onKeyDown={(e) => (e.key === "Enter" ? e.target.blur() : null)}
      />
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        of {pagination.count}
      </span>
    </div>
  );
};

export default Limit;
