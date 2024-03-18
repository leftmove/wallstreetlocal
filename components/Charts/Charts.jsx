import styles from "./Charts.module.css";

import cityTemperature from "@visx/mock-data/lib/mocks/cityTemperature";

import axios from "axios";
import useSWR from "swr";

import { useDispatch, useSelector } from "react-redux";
import { selectCik, selectFilings, setFilings } from "@/redux/filerSlice";

import { font } from "@fonts";

import Loading from "/components/Loading/Loading";
import Allocation from "./Allocation/Allocation";

const server = process.env.NEXT_PUBLIC_SERVER;
const Charts = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const filings = useSelector(selectFilings);

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
        } else {
          const error = new Error("No filings to retrieve.");
          throw error;
        }
      })
      .catch((e) => console.error(e));
  const { isLoading: loading, error } = useSWR(
    cik ? [server + "/filers/filingscomplete", cik] : null,
    ([url, cik]) => filingFetcher(url, cik),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) return <Unavailable />;

  const filingsList = Object.keys(filings).map((an) => filings[an]);
  console.log(filingsList);
  const data = Object.keys(filings).map((accessNumber) => {
    const filing = filings[accessNumber];
    const categories = "";
  });

  return (
    <>
      <div className={styles["charts-overall"]}>
        {loading ? <Loading /> : null}
        <Allocation
          data={cityTemperature.slice(0, 12)}
          width={1000}
          height={400}
          className={[styles["bar-stack"], font.className].join(" ")}
        />
      </div>
    </>
  );
};

export default Charts;
