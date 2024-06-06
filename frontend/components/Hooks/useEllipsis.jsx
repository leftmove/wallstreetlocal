import { useState } from "react";
import useInterval from "./useInterval";

type UseEllipsisReturn = {
  ellipsis?: string;
};

const useEllipsis = (interval: number = 500, pause: boolean = false): UseEllipsisReturn => {
  const [ellipsis, setEllipsis] = useState<string>(".");
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