import { useState } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";
import { selectCik, selectAccess } from "redux/filerSlice";

import { cn } from "components/ui/utils";

function Navigation(props) {
  const page = props.page;

  const cik = props.cik || useSelector(selectCik);
  const an = props.an || useSelector(selectAccess) || null;

  const [hover, setHover] = useState(false);

  const items = [
    page === "overview" ? null : (
      <Link href={`/filers/${cik}/overview`}>
        <li className="cursor-pointer w-fit hover:bg-green-two">Overview</li>
      </Link>
    ),
    page === "holdings" || an === null ? null : (
      <Link href={`/filers/${cik}/${an}/holdings`}>
        <li className="cursor-pointer w-fit hover:bg-green-two">Holdings</li>
      </Link>
    ),
  ];

  return (
    <nav className="flex flex-col m-4 mt-6 mb-0 font-medium font-switzer">
      {/* Overview {">"} {cik} {an ? " > " + an : null} */}
      {cik === "1336528" && (
        <div className="flex justify-between rounded text-nowrap">
          <span className="text-red-800">Warning</span>
          <span className="ml-2 text-black-one">
            This filer is used for debugging. You will likely encounter issues
            when viewing.
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Company</span>
        <div>
          <span>{cik}</span>
          {an && <span className="ml-2">{an}</span>}
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
          {items}
        </div>
        {items.filter((i) => i).length > 0 && (
          <li
            className="transition-all cursor-pointer w-fit hover:bg-green-two hover:text-black-two"
            onMouseEnter={() => setHover(true)}
            onClick={() => setHover(!hover)}
          >
            More
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
