import styles from "components/Explorer/Filer/Explorer.module.css";

import useSWR from "swr";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectBuy,
  selectSell,
  setComparison,
  setFilings,
  editComparison,
  editSort,
  setFilingCount,
} from "redux/filerSlice";

import useFilingStocks from "components/Hooks/useFilingStocks";
import Table from "components/Table/Table";

const server = process.env.NEXT_PUBLIC_SERVER;

export default function Index(props) {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const selected = useSelector(props.order === "buy" ? selectBuy : selectSell);
  const order = props.order || "buy";
  const an = props.an || "";

  const filingFetcher = (url, cik) =>
    axios
      .get(url, {
        params: {
          cik,
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const filings = data.filings;

          dispatch(setFilings(filings));
          dispatch(setComparison({ type: order, access: an }));
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: filingLoading, filingError } = useSWR(
    cik ? [server + "/filing/filer", cik] : null,
    ([url, cik]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
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
          sort: accessor,
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
