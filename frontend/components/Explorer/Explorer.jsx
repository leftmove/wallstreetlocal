import styles from "./Explorer.module.css";

import Error from "next/error";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import {
  selectCik,
  selectPrimary,
  setFilings,
  setComparison,
  selectSecondary,
  editComparison,
  editSort,
  setFilingCount,
} from "@/redux/filerSlice";

import useFilingStocks from "components/Hooks/useFilingStocks";
import Loading from "components/Loading/Loading";
import Table from "components/Table/Table";
import Unavailable from "components/Unavailable/Unavailable";
import Timeline from "./Timeline/Timeline";

const server: string | undefined = process.env.NEXT_PUBLIC_SERVER;

interface Filing {
  access_number: string;
}

interface FilingData {
  filings: Filing[];
}

interface Comparison {
  type: "primary" | "secondary";
  access: string;
}

const Explorer: React.FC = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const primary = useSelector(selectPrimary);
  const secondary = useSelector(selectSecondary);

  const filingFetcher = (url: string, cik: string) =>
    axios
      .get(url, {
        params: {
          cik,
        },
      })
      .then((r) => r.data)
      .then((data: FilingData) => {
        if (data) {
          const filings = data.filings;

          dispatch(setFilings(filings));
          if (primary.access === "") {
            dispatch(
              setComparison({
                type: "primary",
                access: filings[0].access_number,
              })
            );
          }
          if (secondary.access === "") {
            dispatch(
              setComparison({
                type: "secondary",
                access: filings[1].access_number,
              })
            );
          }
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: loading, error } = useSWR(
    cik ? [server + "/filers/filings", cik] : null,
    ([url, cik]: [string, string]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const {
    items: primaryItems,
    loading: primaryLoading,
    error: primaryError,
    headers: primaryHeaders,
    pagination: primaryPagination,
    select: primarySelect,
    reverse: primaryReverse,
    activate: primaryActivate,
    skip: primarySkip,
    paginate: primaryPaginate,
  } = useFilingStocks(
    cik,
    primary,
    (count) => dispatch(setFilingCount({ type: "primary", count })),
    (stocks) => dispatch(editComparison({ type: "primary", stocks })),
    (accessor, direction) =>
      dispatch(
        editSort({
          type: "primary",
          accessor,
          reverse: direction,
        })
      ),
    (offset) => dispatch(editSort({ type: "primary", offset })),
    (pagination) => dispatch(editSort({ type: "primary", pagination }))
  );

  const {
    items: secondaryItems,
    loading: secondaryLoading,
    error: secondaryError,
    headers: secondaryHeaders,
    pagination: secondaryPagination,
    select: secondarySelect,
    reverse: secondaryReverse,
    activate: secondaryActivate,
    skip: secondarySkip,
    paginate: secondaryPaginate,
  } = useFilingStocks(
    cik,
    secondary,
    (count) => dispatch(setFilingCount({ type: "secondary", count })),
    (stocks) => dispatch(editComparison({ type: "secondary", stocks })),
    (accessor, direction) =>
      dispatch(
        editSort({
          type: "secondary",
          accessor,
          reverse: direction,
        })
      ),
    (offset) => dispatch(editSort({ type: "secondary", offset })),
    (pagination) => dispatch(editSort({ type: "secondary", pagination }))
  );

  if (error) return <Unavailable />;

  return (
    <>
      <Timeline />
      <div className={styles["explorer-tables"]}>
        {loading ? <Loading /> : null}
        <div className={styles["table-container"]}>
          {primaryError ? <Error statusCode={404} /> : null}
          <Table
            items={primaryItems}
            loading={primaryLoading}
            headers={primaryHeaders}
            reverse={primaryReverse}
            skip={primarySkip}
            sort={primarySelect}
            activate={primaryActivate}
            paginate={primaryPaginate}
            pagination={primaryPagination}
          />
        </div>
        <div className={styles["table-container"]}>
          {secondaryError ? <Error statusCode={404} /> : null}
          <Table
            items={secondaryItems}
            loading={secondaryLoading}
            headers={secondaryHeaders}
            reverse={secondaryReverse}
            skip={secondarySkip}
            sort={secondarySelect}
            activate={secondaryActivate}
            paginate={secondaryPaginate}
            pagination={secondaryPagination}
          />
        </div>
      </div>
    </>
  );
};

export default Explorer;