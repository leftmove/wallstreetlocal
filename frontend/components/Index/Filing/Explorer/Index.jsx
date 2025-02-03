import styles from "components/Explorer/Filer/Explorer.module.css";

import { cn } from "components/ui/utils";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectBuy,
  selectSell,
  editComparison,
  editSort,
  setFilingCount,
} from "@/redux/filerSlice";

import useFilingStocks from "components/Hooks/useFilingStocks";
import Table from "components/Table/Table";

export default function Index(props) {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const order = props.order || "buy";
  const selected = useSelector(order === "buy" ? selectBuy : selectSell);

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
          sort: accessor,
          reverse: direction,
        })
      ),
    (offset) => dispatch(editSort({ type: order, offset })),
    (pagination) => dispatch(editSort({ type: order, pagination }))
  );

  return (
    <div className={cn(styles["table-container"], props.className)}>
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
