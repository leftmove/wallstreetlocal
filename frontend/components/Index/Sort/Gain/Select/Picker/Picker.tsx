import styles from "./Picker.module.css";
import { useState, useEffect, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { font } from "@fonts";
import { editDate, openDate } from "@/redux/filerSlice";
import { useDispatch } from "react-redux";
import CalendarSVG from "./calendar.svg";
import RightSVG from "./right.svg";
import LeftSVG from "./left.svg";

interface DateProps {
  year: number;
  month: number;
  open: boolean;
  accessor: string;
}

interface PickerProps {
  date: DateProps;
}

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

const yearRegex = /^-?\d+$/;

const Picker: React.FC<PickerProps> = (props) => {
  const date = props.date || {} as DateProps;
  const year = date.year;
  const open = date.open;
  const dispatch = useDispatch();

  const handleDateChange = (e: string) => {
    const value = e.slice(0, -1);
    const character = e.slice(-1);

    let newValue = value;
    if (value.length >= 4) {
      newValue = value.slice(1);
    }

    if (yearRegex.test(character)) {
      newValue = newValue + character;
    }

    setDateDisplay(newValue);
  };

  const handleBlur = () => {
    setFocus(false);
    if (
      dateDisplay.length === 4 &&
      yearRegex.test(dateDisplay) &&
      parseInt(dateDisplay) > 1899 &&
      parseInt(dateDisplay) < 2100
    ) {
      dispatch(
        editDate({
          type: "year",
          accessor: date.accessor,
          value: parseInt(dateDisplay),
        })
      );
    }
  };

  const [dateDisplay, setDateDisplay] = useState<string>(year.toString());
  const [focus, setFocus] = useState<boolean>(false);
  useEffect(() => {
    setDateDisplay(year.toString());
  }, [year]);

  const month = months[date.month] || months[0];
  const display = `${month.name} ${year}`;

  return (
    <div className={styles["picker"]}>
      <button
        onClick={() =>
          dispatch(openDate({ accessor: date.accessor, open: !open }))
        }
        className={styles["date"]}
      >
        <span className={[styles["date-text"], font.className].join(" ")}>
          {display}
        </span>
        <CalendarSVG className={styles["calendar-svg"]} />
      </button>
      <div
        className={[
          styles["date-display"],
          open ? styles["display-expanded"] : "",
        ].join(" ")}
        style={
          open
            ? {
                opacity: "1",
                marginRight: "-420px",
              }
            : {
                opacity: "0",
                marginRight: "0px",
              }
        }
      >
        <div className={[styles["years"], font.className].join(" ")}>
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
            className={styles["year-input"] + " " + font.className}
            value={focus ? dateDisplay : year.toString()}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={(e: FocusEvent<HTMLInputElement>) => handleBlur()}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => (e.key === "Enter" ? e.currentTarget.blur() : null)}
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
        <div className={[styles["months"], font.className].join(" ")}>
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