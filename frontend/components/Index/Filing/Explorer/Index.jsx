import styles from "components/Explorer/Explorer.module.css";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectPrimary,
  selectSecondary,
  editComparison,
  editSort,
  setFilingCount,
} from "@/redux/filerSlice";

import useFilingStocks from "components/Hooks/useFilingStocks";
import Table from "components/Table/Table";

export default function Index(props) {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const order = props.order || "primary";
  const selected = useSelector(
    order === "secondary" ? selectSecondary : selectPrimary
  );

  const {
    items,
    loading,
    error,
    headers,
    pagination,
    select,
    reverse,
    activate,
    skip,
    paginate,
  } = useFilingStocks(
    cik,
    selected,
    (count) => dispatch(setFilingCount({ type: order, count })),
    (stocks) => dispatch(editComparison({ type: order, stocks })),
    (accessor, direction) =>
      dispatch(
        editSort({
          type: order,
          accessor,
          reverse: direction,
        })
      ),
    (offset) => dispatch(editSort({ type: order, offset })),
    (pagination) => dispatch(editSort({ type: order, pagination }))
  );

  return (
    <div className={styles["table-container"]}>
      {/* {error ? <Error statusCode={404} /> : null} */}
      <Table
        items={items}
        loading={loading}
        headers={headers}
        reverse={reverse}
        skip={skip}
        sort={select}
        activate={activate}
        paginate={paginate}
        pagination={pagination}
      />
    </div>
  );
}
