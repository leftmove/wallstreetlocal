import styles from "./Pagination.module.css";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";

import Count from "./Count/Count";
import Limit from "./Limit/Limit";

const Pagination = (props) => {
  const pagination = props.pagination;

  const paginate = (p) => props.paginate(p);
  const skip = (o) => props.skip(o);

  const leftOffset = Number(pagination.offset - pagination.limit);
  const rightOffset = Number(pagination.offset + pagination.limit);

  return pagination.count > 0 ? (
    <div className={styles["pagination"]}>
      <button
        className={styles["pagination-button"]}
        onClick={() => (leftOffset >= 0 ? skip(leftOffset) : null)}
      >
        <LeftIcon className={styles["pagination-icon"]} />
      </button>
      <Count pagination={pagination} skip={skip} />
      <Limit pagination={pagination} paginate={paginate} />
      <button
        className={styles["pagination-button"]}
        onClick={() =>
          rightOffset < pagination.count ? skip(rightOffset) : null
        }
      >
        <RightIcon className={styles["pagination-icon"]} />
      </button>
    </div>
  ) : null;
};

export default Pagination;
