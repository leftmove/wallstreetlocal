import styles from "./Table.module.css";
import { useEffect } from "react";

import axios from "axios";
import useSWR from "swr";

import Error from "next/error";

import Loading from "@/components/Loading/Loading";
import Header from "./Headers/Header";
import Row from "./Row/Row";
import Sort from "./Sort/Sort";

import { useDispatch, useSelector } from "react-redux";
import { setStocks, selectCik, selectStocks } from "@/redux/filerSlice";

// const fetcher = (url, stocks, dispatch) => {
//   console.log("here:", stocks);
//   axios
//     .post(url, {
//       cusips: [...Object.entries(stocks)].map((s) => s.cusip),
//     })
//     .then((res) => res.data)
//     .then((data) => {
//       const results = data.results;
//       const updatedStocks = new Map(
//         Object.keys(stocks).map((cusip) => {
//           const stock = stocks[cusip];
//           const result = results[cusip];
//           return { ...stock, ...result };
//         })
//       );
//       dispatch(setStocks(updatedStocks));
//     });
// };

// const table = stocks.map((stock) => {
//   const cusip = stock.cusip;
//   const name = stock.name;
//   const ticker = stock.ticker;
//   const sector = stock.sector;
//   const industry = stock.industry;

//   const priceRecent = stock.recent_price;
//   const priceBought = stock.timeseries
//     ? stock.timeseries[stock.prices.buy].close
//     : "NA";

//   const sharesHeld = stock.shares_held
//     .toString()
//     .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   const marketValue = `$${stock.market_value
//     .toString()
//     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
//   const portfolioPercentage = stock.percent_portfolio
//     ? `${(stock.percent_portfolio * 100).toFixed(2)}`
//     : "NA";
//   const ownershipPercantage =
//     stock.percent_ownership !== "NA"
//       ? `${(stock.percent_ownership * 100).toFixed(2)}`
//       : "NA";
//   const percentGain =
//     stock.recent_price == "NA"
//       ? "NA"
//       : (((priceRecent - priceBought) / priceBought) * 100).toFixed(2);

//   const buyDate = stock.timeseries
//     ? new Date(stock.timeseries[stock.prices.buy].time * 1000)
//     : "NA";
//   const reportDate = new Date(stock.date * 1000);
//   const buyQtr =
//     buyDate !== "NA"
//       ? `${quarters[buyDate.getMonth()]} ${buyDate.getFullYear()}`
//       : "NA";
//   const reportQtr = `${
//     quarters[reportDate.getMonth()]
//   } ${reportDate.getFullYear()}`;

//   return (
//     <tr key={cusip}>
//       <td // Name
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {name} ({ticker})
//       </td>
//       <td // Sector
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {sector}
//       </td>
//       <td // Industry
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {industry}
//       </td>
//       <td // Shares Held
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {sharesHeld}
//       </td>
//       <td // Market Value
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {marketValue}
//       </td>
//       <td // % of Portfolio
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {portfolioPercentage}
//       </td>
//       <td // % Ownership
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {ownershipPercantage}
//       </td>
//       <td // Buy Date
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {buyQtr}
//       </td>
//       <td // Price Paid
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {priceBought}
//       </td>
//       <td // Recent Price
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {priceRecent}
//       </td>
//       <td // % Gain
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {percentGain}
//       </td>
//       <td // Date
//         className={[
//           styles["column"],
//           styles["body-column"],
//           inter.className,
//         ].join(" ")}
//       >
//         {reportQtr}
//       </td>
//     </tr>
//   );
// });

// useEffect(() => {
//   const url = "/api/stocks/info";
//   const time = 24 * 1000 * 60 * 60;
//   const cacheStocks = async (url) => {
//     const value = cacheData.get(url);
//     if (value) {
//       return value;
//     } else {
//       return false;
//     }
//   };

//   cacheStocks(url).then((check) => {
//     if (check) {
//       console.log(check);
//       dispatch(setStocks(check));
//     } else {
//       const stocks = Object.keys(filer.stocks).map(
//         (cusip) => filer.stocks[cusip]
//       );
//       axios
//         .post(url, {
//           cusip: stocks.map((s) => s.cusip),
//         })
//         .then((res) => res.data)
//         .then((data) => {
//           const results = data.results;
//           const cache = stocks.map((stock) => {
//             const cusip = stock.cusip;
//             const result = results[cusip];
//             return { ...stock, ...result };
//           });
//           cacheData.put(url, cache, time);
//           dispatch(setStocks(cache));
//           setStatus("");
//         })
//         .catch((e) => {
//           setStatus("error");
//         });
//     }
//   });

//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

// switch (accessor) {
//   case "name":
//     case "sector":
//     case "industry":
//       next.sort((a, b) => {
//         if (a[accessor] === undefined) {
//           return 1;
//         } else if (b[accessor] === undefined) {
//           return -1;
//         } else {
//           return a[accessor].localeCompare(b[accessor]);
//         }
//       });
//       break;
//     case "shares_held":
//     case "market_value":
//     case "percent_portfolio":
//     case "percent_ownership":
//     case "percent_gain":
//     case "recent_price":
//     case "price_paid":
//     case "date":
//       next.sort((a, b) => a[accessor] - b[accessor]);
//       break;
//     case "buy":
//       next.sort((a, b) => {
//         return (
//           new Date(a.prices[accessor]).getTime() -
//           new Date(b.prices[accessor]).getTime()
//         );
//       });
//   }
// switch (sort.type) {
//   case "string":
//     next.sort((a, b) => a[accessor].localeCompare(b[accessor]));
//   case "number":
//     next.sort((a, b) => a[accessor] - b[accessor]);
// }

// const cacheStocks = async (url) => {
//   const value = cacheData.get(url);
//   if (value) {
//     return value;
//   } else {
//     return false;
//   }
// };

// const [status, setStatus] = useReducer(
//   (prev, next) => {
//     prev.building = prev.loading = prev.error = false;
//     return { ...prev, ...next };
//   },
//   {
//     loading: true,
//     building: false,
//     error: false,
//   }
// );
// useEffect(() => {
//   axios
//     .get("/api/stocks/info", {
//       params: { cik: filer.cik },
//     })
//     .then((res) => res.data)
//     .then((data) => {
//       dispatch(setStocks(data.stocks));
//       setStatus({ loading: false });
//     })
//     .catch((e) => {
//       console.error(e);
//       setStatus({ error: true });
//     });

//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

const getFetcher = (url, cik) =>
  axios
    .get(url, { params: { cik: cik } })
    .then((r) => {
      if (r.status == 201 || r.status == 429) {
        const error = new Error("Filer building.");
        error.info = r.data;
        error.status = r.status;

        throw error;
      }
      return r.data;
    })
    .catch((e) => console.error(e));

const Table = () => {
  const dispatch = useDispatch();
  const cik = useSelector(selectCik);
  const stocks = useSelector(selectStocks);

  const {
    data,
    error,
    isLoading: loading,
  } = useSWR(["/api/stocks/info", cik], ([url, cik]) => getFetcher(url, cik), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  useEffect(() => {
    if (data) {
      dispatch(setStocks(data.stocks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (error) return <Error statusCode={404} />;
  if (loading) return <Loading />;

  return (
    <div className={styles["table-container"]}>
      <Sort />
      <table className={styles["table"]}>
        <thead>
          <Header />
        </thead>
        <tbody>
          {stocks.map((s) => (
            <Row key={s.cusip} stock={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
