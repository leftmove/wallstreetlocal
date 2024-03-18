import styles from "./Charts.module.css";

import cityTemperature from "@visx/mock-data/lib/mocks/cityTemperature";

import axios from "axios";
import useSWR from "swr";

import { useSelector } from "react-redux";
import { selectCik } from "@/redux/filerSlice";

import { font } from "@fonts";

import Loading from "/components/Loading/Loading";
import Allocation from "./Allocation/Allocation";

const server = process.env.NEXT_PUBLIC_SERVER;
const Charts = () => {
  const cik = useSelector(selectCik);

  const analysisFetcher = (url, cik, key) =>
    axios
      .get(url, {
        params: {
          cik,
          key,
        },
      })
      .then((r) => r.data)
      .then((data) => {
        if (data) {
          const filings = data.filings;
          return filings;
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const {
    data: allocationData,
    isLoading: allocationLoading,
    error: allocationError,
  } = useSWR(
    cik ? [server + "/filers/analysis", cik, "allocation"] : null,
    ([url, cik, key]) => analysisFetcher(url, cik, key),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (allocationError) return <Unavailable />;
  if (allocationLoading || !allocationData) return <Loading />;

  const allocationList = allocationData
    .filter((a) => a.industries.OTHER.percentage != 100)
    .sort((a, b) => a.report_date - b.report_date)
    .map((a) => {
      const date = new Date(a.report_date * 1000);
      const year = date.getFullYear();
      const quarter = [
        "Q1",
        "Q1",
        "Q1",
        "Q2",
        "Q2",
        "Q2",
        "Q3",
        "Q3",
        "Q3",
        "Q4",
        "Q4",
        "Q4",
      ][date.getMonth()];
      const quarterYear = `${quarter} ${year}`;

      const industries = {};
      Object.keys(a.industries).map(
        (i) => (industries[i] = a.industries[i]?.percentage || 0)
      );

      return {
        date: quarterYear,
        ...industries,
      };
    })
    .slice(-13, -1);

  console.log(allocationList);

  return (
    <>
      <div className={styles["charts-overall"]}>
        <Allocation
          data={allocationList}
          width={1300}
          height={800}
          className={[styles["bar-stack"], font.className].join(" ")}
          legendClassName={styles["legend"]}
          colors={["var(--primary)", "var(--secondary)", "var(--primary-dark)"]}
          backgroundTooltip="var(--offwhite)"
        />
      </div>
    </>
  );
};

export default Charts;
