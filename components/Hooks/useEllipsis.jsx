import { useState } from "react";

import useInterval from "./useInterval";

const useEllipsis = (interval = 500) => {
  const [ellipsis, setEllipsis] = useState(".");
  useInterval(() => {
    setEllipsis(ellipsis === "..." ? "." : ellipsis + ".");
  }, interval);

  return { ellipsis };
};

export default useEllipsis;
