import tableStyles from "../Table.module.css";

import { useSelector } from "react-redux";
import { selectHeaders, selectSort } from "@/redux/filerSlice";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

// const quarters = [
//   "Q1",
//   "Q1",
//   "Q1",
//   "Q2",
//   "Q2",
//   "Q2",
//   "Q3",
//   "Q3",
//   "Q3",
//   "Q4",
//   "Q4",
//   "Q4",
// ];
// const name = (s) => s.name;
// const sector = (s) => s.sector;
// const industry = (s) => (s.update ? s.industry : "NA");
// const sharesHeld = (s) =>
//   s.shares_held.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// const marketValue = (s) =>
//   `$${s.market_value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
// const percentPortfolio = (s) =>
//   s.percent_portfolio || s.percent_portfolio == "NA"
//     ? "NA"
//     : (stock.percent_portfolio * 100).toFixed(2);
// const percentOwnership = (s) =>
//   s.percent_ownership || s.percent_ownership == "NA"
//     ? "NA"
//     : `${(s.percent_ownership * 100).toFixed(2)}`;
// const buyDate = (s) => {
//   if (s.timeseries) {
//     const date = new Date(s.timeseries[s.prices.buy].time * 1000);
//     return `${quarters[date.getMonth()]} ${date.getFullYear()}`;
//   } else {
//     return "NA";
//   }
// };
// const pricePaid = (s) =>
//   s.timeseries ? s.timeseries[s.prices.buy].close : "NA";
// const recentPrice = (s) =>
//   s.price_recent || s.price_recent == "NA" ? s.price_recent : "NA";
// const percentGain = (s) => {
//   const timeseries = s.timeseries;
//   if (timeseries) {
//     const now = s.price_recent;
//     const then = timeseries[s.prices.buy].close;
//     return (((now - then) / then) * 100).toFixed(2);
//   } else {
//     return "NA";
//   }
// };
// const reportDate = (s) => {
//   const date = new Date(s.date * 1000);
//   return `${quarters[date.getMonth()]} ${date.getFullYear()}`;
// };
// switch (header.accessor) {
//   case "name":
//     if (stock.name == "NA") {
//       return stock.update ? stock.ticker : "NA";
//     }
//     return stock.update ? `${stock.name} (${stock.ticker})` : stock.name;
//   case "class":
//     return stock.class;
//   case "sector":
//     return stock.sector;
//   case "industry":
//     return stock.update ? stock.industry : "NA";
//   case "shares_held":
//     return stock.shares_held
//       .toString()
//       .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   case "market_value":
//     return `$${stock.market_value
//       .toString()
//       .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
//   case "percent_portfolio":
//     return stock.percent_portfolio || stock.percent_portfolio != "NA"
//       ? (stock.percent_portfolio * 100).toFixed(2)
//       : "NA";
//   case "percent_ownership":
//     return stock.percent_ownership || stock.percent_ownership != "NA"
//       ? (stock.percent_ownership * 100).toFixed(2).toString()
//       : "NA";
//   case "percent_gain":
//     const timeseries = stock.timeseries;
//     if (timeseries) {
//       const now = stock.price_recent;
//       const then = timeseries[stock.prices.buy].close;
//       return (((now - then) / then) * 100).toFixed(2);
//     } else {
//       return "NA";
//     }
//   case "price_recent":
//     return stock.price_recent || stock.price_recent != "NA"
//       ? stock.price_recent
//       : "NA";
//   case "price_paid":
//     return stock.timeseries
//       ? stock.timeseries[stock.prices.buy].close
//       : "NA";
//   case "buy":
//     if (stock.timeseries) {
//       const date = new Date(
//         stock.timeseries[stock.prices.buy].time * 1000
//       );
//       return `${quarters[date.getMonth()]} ${date.getFullYear()}`;
//     } else {
//       return "NA";
//     }
//   case "date":
//     const date = new Date(stock.date * 1000);
//     return `${quarters[date.getMonth()]} ${date.getFullYear()}`;
// }

// const columns = headers.map((h) => {
//   switch (h.accessor) {
//     case "name":
//       return name(stock);
//     case "sector":
//       return sector(stock);
//     case "industry":
//       return industry(stock);
//     case "shares_held":
//       return sharesHeld(stock);
//     case "market_value":
//       return marketValue(stock);
//     case "percent_portfolio":
//       return percentPortfolio(stock);
//     case "percent_ownership":
//       return percentOwnership(stock);
//     case "percent_gain":
//       return percentGain(stock);
//     case "price_recent":
//       return recentPrice(stock);
//     case "price_paid":
//       return pricePaid(stock);
//     case "buy_date":
//       return buyDate(stock);
//     case "report_date":
//       return reportDate(stock);
//   }
// });

// const structureStock = (stock, headers) => {
//   const fields = headers
//     .filter((header) => header.active)
//     .map((header) => stock[header.accessor]);

//   return fields;
// };

const Row = (props) => {
  const stock = props.stock;

  const headers = useSelector(selectHeaders);
  const sortHeader = useSelector(selectSort).sort;

  return (
    <tr>
      {headers
        .filter((h) => h.active)
        .map((h) => {
          const display = stock[h.accessor];
          return (
            <td
              key={`${stock.cusip} (${h.display})`}
              className={[
                tableStyles["column"],
                tableStyles["body-column"],
                // sortHeader === h.sort
                //   ? tableStyles["column-highlighted"]
                //   : tableStyles["column-dehighlighted"],
                inter.className,
              ].join(" ")}
            >
              {display}
            </td>
          );
        })}
    </tr>
  );
};

export default Row;
