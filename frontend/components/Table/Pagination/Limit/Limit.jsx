import styles from "../Pagination.module.css";
import { useEffect, useState } from "react";

import { setPagination, selectPagination } from "@/redux/filerSlice";
import { useDispatch, useSelector } from "react-redux";

import { font } from "@fonts";

const Limit = () => {
  const dispatch = useDispatch();
  const pagination = useSelector(selectPagination);

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
      dispatch(setPagination(paginationLimit));
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
        value={focus ? paginationLimit : pagination.limit}
        onKeyDown={(e) => (e.key === "Enter" ? e.target.blur() : null)}
      />
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        of {pagination.count}
      </span>
    </div>
  );
};

export default Limit;
