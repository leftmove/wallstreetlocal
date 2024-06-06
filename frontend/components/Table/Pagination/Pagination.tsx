import styles from "./Pagination.module.css";

import LeftIcon from "@/public/static/right.svg";
import RightIcon from "@/public/static/left.svg";

import Count from "./Count/Count";
import Limit from "./Limit/Limit";

interface PaginationProps {
  pagination: PaginationData;
  paginate: (page: number) => void;
  skip: (offset: number) => void;
}

interface PaginationData {
  offset: number;
  limit: number;
  count: number;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const pagination = props.pagination;

  const paginate = (p: number) => props.paginate(p);
  const skip = (o: number) => props.skip(o);

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