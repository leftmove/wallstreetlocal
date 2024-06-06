import styles from "../Pagination.module.css";
import { useEffect, useState, ChangeEvent, FocusEvent, KeyboardEvent } from "react";

import { font } from "@fonts";

interface PaginationProps {
  pagination: Pagination;
  paginate: (p: number) => void;
}

interface Pagination {
  count: number;
  limit: number;
}

const Limit = (props: PaginationProps) => {
  const pagination = props.pagination;
  const setPagination = (p: number) => props.paginate(p);

  const [focus, setFocus] = useState(false);
  const [paginationLimit, setPaginationLimit] = useState(100);

  useEffect(() => {
    if (pagination.count <= 100) {
      setPaginationLimit(pagination.count);
      setPagination(pagination.count);
      setFocus(false);
    }
  }, [pagination.count, setPagination]);

  const handleBlur = () => {
    if (paginationLimit > 0) {
      setPagination(paginationLimit);
    }
    setFocus(false);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    isNaN(e.target.value as any) ? null : setPaginationLimit(Number(e.target.value));

  return (
    <div className={styles["pagination-display"]}>
      <input
        className={[styles["pagination-input"], font.className].join(" ")}
        onFocus={() => setFocus(true)}
        onBlur={() => handleBlur()}
        onChange={(e) => handleChange(e)}
        type="text"
        value={focus ? paginationLimit : pagination.limit}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => (e.key === "Enter" ? (e.target as HTMLInputElement).blur() : null)}
      />
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        of {pagination.count}
      </span>
    </div>
  );
};

export default Limit;