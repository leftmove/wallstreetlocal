import styles from "./Charts.module.css";

import axios from "axios";
import useSWR from "swr";

import { useParentSize } from "@visx/responsive";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind.config.js";

import Allocation from "./Allocation/Allocation";

const fullConfig = resolveConfig(tailwindConfig);

const server = process.env.NEXT_PUBLIC_SERVER;
const fetcher = (url, cik, key) =>
  axios.get(url, { params: { cik, key } }).then((res) => res.data);

const Charts = (props) => {
  const cik = props.cik || null;

  const {
    data,
    isLoading: loading,
    error,
  } = useSWR(
    cik ? [server + "/filers/analysis", cik, "allocation"] : null,
    ([url, cik, key]) => fetcher(url, cik, key)
  );
  const { width, height, parentRef } = useParentSize({ debounceTime: 150 });

  const industries = new Set(
    data?.filings.map((f) => Object.keys(f.industries)).flat(2)
  );
  const samples = data?.filings
    .sort((a, b) => a.report_date - b.report_date)
    .map((f) => {
      const date = new Date(f.report_date * 1000).toLocaleDateString();
      const sample = {};
      industries.forEach((i) => {
        sample[i] = f.industries[i]?.percentage.toFixed(2).toString() || "0";
      });
      return { date, ...sample };
    });

  return (
    <>
      <div className="flex justify-center w-full pt-8 h-96" ref={parentRef}>
        <Allocation
          customData={samples}
          customKeys={Array.from(industries)}
          xMax={width}
          width={width}
          height={height}
          margin={{ top: 40, left: 50, right: 40, bottom: 30 }}
        />
      </div>
    </>
  );
};

export default Charts;
