import styles from "./Picker.module.css";
import { useState, useEffect } from "react";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

import { editDate } from "@/redux/dateSlice";
import { useSelector, useDispatch } from "react-redux";

import CalendarSVG from "./calendar.svg";
import RightSVG from "./right.svg";
import LeftSVG from "./left.svg";

const months = [
  { name: "Jan", value: 0 },
  { name: "Feb", value: 1 },
  { name: "Mar", value: 2 },
  { name: "Apr", value: 3 },
  { name: "May", value: 4 },
  { name: "Jun", value: 5 },
  { name: "Jul", value: 6 },
  { name: "Aug", value: 7 },
  { name: "Sep", value: 8 },
  { name: "Oct", value: 9 },
  { name: "Nov", value: 10 },
  { name: "Dec", value: 11 },
];

const Picker = (props) => {
  const date = props.date;
  const index = props.index
  const year = date.year;
  const dispatch = useDispatch();

  const handleDateChange = (e) => {
    const value = e.slice(0, -1);
    const character = e.slice(-1);

    let newValue = value;
    if (value.length >= 4) {
      newValue = value.slice(1);
    }

    if (/^-?\d+$/.test(character)) {
      newValue = newValue + character;
    }

    setDateDisplay(newValue);
  };
  const handleBlur = () => {
    setFocus(false);
    if (
      dateDisplay.length === 4 &&
      /^-?\d+$/.test(dateDisplay) &&
      dateDisplay > 1899 &&
      dateDisplay < 2100
    ) {
      dispatch(
        editDate({
          type: "year",
          accessor: date.accessor,
          value: dateDisplay,
        })
      );
    }
  };

  const [dateDisplay, setDateDisplay] = useState(year);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    setDateDisplay(year);
  }, [year]);

  const month = months[date.month];
  const display = `${month.name} ${year}`;

  return (
    <div className={styles["picker"]}>
      <button onClick={() => setOpen(!open)} className={styles["date"]} style={{zIndex: 100 - index}}>
        <span className={[styles["date-text"], inter.className].join(" ")}>
          {display}
        </span>
        <CalendarSVG className={styles["calendar-svg"]} />
      </button>
      <div
        className={[styles["date-display"]].join(" ")}
        style={
          {
            zIndex: 99 - index,
            ...open
            ? {
                opacity: "1",
                marginRight: "-400px",
              }
            : {
                opacity: "0",
                marginRight: "0px",
              }}
        }
      >
        <div className={[styles["years"], inter.className].join(" ")}>
          <button
            className={styles["chevron-button"]}
            onClick={() =>
              dispatch(
                editDate({
                  type: "year",
                  accessor: date.accessor,
                  value: year - 1,
                })
              )
            }
          >
            <LeftSVG className={styles["chevron"]} />
          </button>
          <input
            type="text"
            className={styles["year-input"] + " " + inter.className}
            value={focus ? dateDisplay : year}
            onChange={(e) => handleDateChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => handleBlur()}
            onKeyDown={(e) => (e.key === "Enter" ? e.target.blur() : null)}
          />
          <button
            className={styles["chevron-button"]}
            onClick={() =>
              dispatch(
                editDate({
                  type: "year",
                  accessor: date.accessor,
                  value: year + 1,
                })
              )
            }
          >
            <RightSVG className={styles["chevron"]} />
          </button>
        </div>
        <div className={[styles["months"], inter.className].join(" ")}>
          {months.map((month) => (
            <button
              key={month.value}
              onClick={() =>
                dispatch(
                  editDate({
                    type: "month",
                    value: month.value,
                    accessor: date.accessor,
                  })
                )
              }
              className={[
                styles["month"],
                month.value == date.month ? styles["month-selected"] : "",
              ].join(" ")}
            >
              {month.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Picker;
