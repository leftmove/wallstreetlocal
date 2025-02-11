import { useState } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";
import { selectCik, selectAccess } from "redux/filerSlice";

import { cn } from "components/ui/utils";

function Navigation(props) {
  const page = props.page;

  const metadata = useSelector((state) => state.filer?.accessNumbers) || {};
  const cik = props.cik || useSelector(selectCik);
  const an = props.an || useSelector(selectAccess) || null;

  const [hover, setHover] = useState(false);

  return (
    <nav className="flex flex-col m-4 mt-6 mb-0 font-medium font-switzer">
      {/* Overview {">"} {cik} {an ? " > " + an : null} */}
      <div className="flex justify-between">
        <span>Company</span>
        <div>
          <span>{cik}</span>
          {an ? <span className="ml-2">{an}</span> : null}
        </div>
      </div>
      <ul
        className="mt-1 ml-2 text-black-one"
        onMouseLeave={() => setHover(false)}
      >
        <li className={cn("cursor-pointer w-fit")}>
          {page === "overview" && "Overview"}
          {page === "holdings" && "Holdings"}
        </li>
        <div
          className={cn(
            "max-h-0 overflow-hidden transition-all",
            hover && "max-h-12"
          )}
        >
          {page === "overview" ? null : (
            <Link href={`/filers/${cik}/overview`}>
              <li className="cursor-pointer w-fit hover:bg-green-two">
                Overview
              </li>
            </Link>
          )}
          {page === "holdings" ? null : (
            <Link href={`/filers/${cik}/${an}/holdings`}>
              <li className="cursor-pointer w-fit hover:bg-green-two">
                Holdings
              </li>
            </Link>
          )}
        </div>
        <li
          className="transition-all cursor-pointer w-fit hover:bg-green-two hover:text-black-two"
          onMouseEnter={() => setHover(true)}
          onClick={() => setHover(!hover)}
        >
          More
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
