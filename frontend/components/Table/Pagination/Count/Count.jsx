import styles from "../Pagination.module.css";
import { useEffect, useState, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { font } from "@fonts";

interface Pagination {
  count: number;
  limit: number;
  offset: number;
}

interface CountProps {
  pagination: Pagination;
  skip: (offset: number) => void;
}

const Count: React.FC<CountProps> = (props) => {
  const pagination = props.pagination;
  const setOffset = (o: number) => props.skip(o);

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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    isNaN(Number(e.target.value)) ? null : setPageCount(Number(e.target.value));

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
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => (e.key === "Enter" ? e.currentTarget.blur() : null)}
      />
      <span className={[styles["pagination-text"], font.className].join(" ")}>
        of {totalPageCount}
      </span>
    </div>
  );
};

export default Count;