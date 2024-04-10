import { useState } from "react";

import useInterval from "./useInterval";

const useEllipsis = (interval = 500, pause = false) => {
  const [ellipsis, setEllipsis] = useState(".");
  useInterval(() => {
    if (!pause)
    setEllipsis(ellipsis === "..." ? "." : ellipsis + ".");
  }, interval);
  if (pause) {
    return {};
  }
  return { ellipsis };
};

export default useEllipsis;
