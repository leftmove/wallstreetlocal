import styles from "./Select.module.css";
import { useState, useEffect } from "react";

import useSWR from "swr";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import {
  addHeader,
  updateStocks,
  selectCik,
  selectHeaders,
  activateHeader,
  editHeader,
} from "@/redux/filerSlice";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import Picker from "./Picker/Picker";
import Loading from "@/components/Loading/Loading";

// const animateLayoutChanges = (args) => {
//   const { isSorting, wasSorting } = args;

//   if (isSorting || wasSorting) {
//     return defaultAnimateLayoutChanges(args);
//   }

//   return true;
// };

const getFetcher = (url, cik, time) =>
  axios
    .get(url, { params: { cik: cik, time: time } })
    .then((r) => r.data)
    .catch((e) => console.error(e));

const Select = (props) => {
  const propDate = props.date;
  const accessor = propDate.accessor;
  const index = props.index;
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const headers = useSelector(selectHeaders);

  const date =
    useSelector((state) =>
      state.filer.dates.find((d) => d.accessor == propDate.accessor)
    ) || propDate;
  const open = date.open;
  const time = date.timestamp;
  const {
    data,
    error,
    isLoading: loading,
  } = useSWR(
    open ? null : ["/api/stocks/timeseries", cik, time],
    ([url, cik, time]) => getFetcher(url, cik, time)
  );
  useEffect(() => {
    if (open) return;

    if (data) {
      const timeseries = {};
      data.stocks.forEach((price) => {
        const close = price.close_str;
        const cusip = price.cusip;
        timeseries[cusip] = close;
      });

      dispatch(
        updateStocks({
          field: accessor,
          values: timeseries,
        })
      );
      const display = `${date.month}/${date.day}/${date.year}`;
      dispatch(editHeader({ accessor: accessor, display: display }));
    }
  }, [open, data, accessor, dispatch, date]);
  // useEffect(() => {
  //   if (open) return;

  //   axios
  //     .get("/api/stocks/timeseries", { params: { cik: cik, time: time } })
  //     // .then((r) => r.data)
  //     .then((r) => {
  //       const url = axios.getUri({
  //         url: "api/stocks/timeseries",
  //         params: { cik: cik, time: time },
  //       });
  //       console.log(url);
  //       return r.data;
  //     })
  //     .then((data) => {
  //       const timeseries = {};
  //       data.stocks.forEach((price) => {
  //         const close = price.close_str;
  //         const cusip = price.cusip;
  //         timeseries[cusip] = close;
  //       });

  //       dispatch(
  //         updateStocks({
  //           field: accessor,
  //           values: timeseries,
  //         })
  //       );
  //     })
  //     .catch((e) => console.error(e));
  // }, [date, open, cik, time, dispatch, accessor]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: accessor });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [active, setActive] = useState(true);
  const addToTable = () => {
    const header = headers.find((h) => h.accessor == accessor);
    if (header) {
      setActive(header.active);
    } else {
      setActive(false);
    }

    const display = `Price (${date.month + 1}/${date.day}/${date.year})`;
    if (header) {
      dispatch(activateHeader(accessor));
    } else {
      dispatch(
        addHeader({
          display: display,
          sort: accessor,
          accessor: accessor,
          active: true,
        })
      );
    }
  };

  if (error) {
    console.error(e);
  }

  return (
    <div
      className={styles["date"]}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {loading ? <Loading /> : null}
      {/* <div className={styles["plus-minus"]}>
          <button
            className={styles["date-button"]}
            onClick={() => handleRemove()}
          >
            <Minus />
          </button>
          <button className={styles["date-button"]} onClick={() => handleAdd()}>
            <Plus />
          </button>
        </div> */}
      <Picker date={date} index={index} />
      <button
        className={[
          styles["button"],
          inter.className,
          active ? "" : styles["remove-table"],
        ].join(" ")}
        onClick={() => addToTable()}
      >
        Table
      </button>
      <button
        className={[styles["button"], styles["download"], inter.className].join(
          " "
        )}
      >
        Download
      </button>
    </div>
  );
};

export default Select;
