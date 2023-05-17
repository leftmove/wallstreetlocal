import styles from "./Select.module.css";
import { useState, useRef } from "react";

import { useDispatch } from "react-redux";
import { newDate, removeDate } from "@/redux/dateSlice";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });
import { CSSTransition } from "react-transition-group";

import Picker from "./Picker/Picker";
import Plus from "./plus.svg";
import Minus from "./minus.svg";

const Select = (props) => {
  const date = props.date;
  const index = props.key;

  const dispatch = useDispatch();

  const [show, setShow] = useState(true);
  const nodeRef = useRef(null);
  const handleAdd = () => {
    setShow(true);
    dispatch(newDate());
  };
  const handleRemove = () => {
    setShow(false);
    dispatch(removeDate(date.accessor));
  };

  return (
    <CSSTransition
      in={show}
      nodeRef={nodeRef}
      timeout={333}
      classNames={{
        enterActive: styles["date-transition-enter-active"],
        enterDone: styles["date-transition-enter-done"],
        exitActive: styles["date-transition-exit-active"],
        exitDone: styles["date-transition-exist-done"],
      }}
      unmountOnExit
      onEnter={() => setShow(false)}
      onExited={() => setShow(true)}
    >
      <div
        className={styles["date"]}
        ref={nodeRef}
        //        style={show ? {} : { transform: "translateX(-210px)", opacity: 0 }}
      >
        <div className={styles["plus-minus"]}>
          <button
            className={styles["date-button"]}
            onClick={() => handleRemove()}
          >
            <Minus />
          </button>
          <button className={styles["date-button"]} onClick={() => handleAdd()}>
            <Plus />
          </button>
        </div>
        <Picker date={date} index={index} />
        <button className={[styles["button"], inter.className].join(" ")}>
          Add to Table
        </button>
        <button
          className={[
            styles["button"],
            styles["download"],
            inter.className,
          ].join(" ")}
        >
          Download Data
        </button>
        {/* Make Green? */}
      </div>
    </CSSTransition>
  );
};

export default Select;
