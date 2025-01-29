"use server";

import styles from "@/styles/Home.module.css";

import axios from "axios";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import {
  FileText,
  Database,
  Download,
  Search as Magnify,
  TrendingUp,
  BarChart,
} from "lucide-react";
import { font, fontLight, fontBold } from "fonts";
import { cn } from "components/ui/utils";
import Layout from "components/Layouts/Home";

import Suggested from "components/Suggested/Suggested";
import Health from "components/Health/Health";
import Hero from "@/images/hero.jpg";
import MainButton from "components/Buttons/Primary";
import SideButton from "components/Buttons/Secondary";
import BottomButton from "components/Buttons/Tertiary";

import Search from "components/Search/Homepage/Search";
import Example from "components/Search/Homepage/Example";
import { examples } from "components/Search/Homepage/Example";

// SEO terms taken from SEMrush
const keywords =
  "13f, 13f filings, berkshire hathaway, warren buffet, micheal burry, pershing square, citadel, melvin capital";

// function Example({
//   name,
//   people,
//   date,
//   cik,
//   tickers,
//   marketValue,
//   topHoldings,
//   holdings,
//   className,
// }) {
//   return (
//     <div
//       className={cn(
//         "flex flex-col w-full z-10 hover:scale-105 border-2 border-black-one transition-all duration-100 ease-in-out hover:z-20 p-4 rounded-md bg-offwhite-one",
//         className
//       )}
//     >
//       <div className="flex items-center justify-between text-black-one">
//         <Link href={`/filers/${cik}/overview`}>
//           <h3 className="text-lg font-bold text-green-three text-wrap">
//             {name}
//           </h3>
//         </Link>
//         <span className="hidden text-sm md:block">{date}</span>
//         <Link href={`/filers/${cik}/overview`}>
//           <span className="text-sm ">{cik}</span>
//         </Link>
//       </div>
//       <div className="flex justify-between text-black-one">
//         <p className="text-sm ">{people.join(", ")}</p>
//         <p className="text-sm ">{tickers.join(", ")}</p>
//       </div>
//       <div className="flex justify-between">
//         <p className="text-sm text-wrap">${marketValue.toLocaleString()}</p>
//         <p className="hidden text-sm md:block">{topHoldings.join(", ")}</p>
//       </div>
//       <div className="w-full mt-6 overflow-x-auto">
//         <table className="w-full border-[3px] rounded bg-white-one border-black-three">
//           <thead className="font-mono text-xs text-black-one">
//             <tr>
//               <th className="border-2 border-opacity-30 border-black-one">
//                 Ticker
//               </th>
//               <th className="border-2 border-opacity-30 border-black-one">
//                 Market Value
//               </th>
//               <th className="border-2 border-opacity-30 border-black-one">
//                 % Portfolio
//               </th>
//             </tr>
//           </thead>
//           <tbody className="font-mono text-sm text-center text-black-one">
//             {holdings.map(({ ticker, marketValue, percentPortfolio }) => (
//               <tr key={ticker}>
//                 <td className="border-2 border-opacity-30 border-black-one">
//                   {ticker}
//                 </td>
//                 <td className="border-2 border-opacity-30 border-black-one">
//                   ${marketValue.toLocaleString()}
//                 </td>
//                 <td className="border-2 border-opacity-30 border-black-one">
//                   {percentPortfolio}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

export default function About(props) {
  return (
    <>
      <main className="flex justify-between overflow-hidden lg:h-[100vh] md:p-10 p-4 bg-black-two border-t-2 border-opacity-50 border-black-three font-switzer lg:p-16">
        <section className="relative flex flex-col w-1/2 p-4">
          <h1 className="flex-wrap w-full text-2xl font-bold text-left text-offwhite-one md:text-4xl lg:text-6xl">
            The SEC
          </h1>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-white-one">
            The Securities and Exchange Commission (SEC) keeps a record of every
            company in the United States. Companies whose valuations surpass a
            certain threshold though, are required to file some special forms.
          </p>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-white-one">
            These forms, usually filed quarterly, can disclose the filer's
            holdings, update investors on current strategy, and provide all
            kinds of other useful financial data. With the purpose being to
            level the playing field for all investors, required SEC filings
            makes America's largest companies provide transparency.
          </p>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-white-one">
            The problem though, is that these holdings are often cumbersome to
            access, and valuable analysis is often hidden behind a paywall.
            Through wallstreetlocal, the SEC's filing system becomes more
            accessible and open.
            {/* <div className="flex justify-end w-full">
            <Search className="justify-end w-1/2 mt-4" />
          </div>   */}
          </p>
        </section>
        <section className="w-1/2 p-4">
          <h1 className="flex-wrap w-full text-2xl font-bold text-left text-offwhite-one md:text-4xl lg:text-6xl">
            What We Do
          </h1>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-white-one">
            When you request a filer on wallstreetlocal, we go through our
            latest dump of the SEC's search database, and query the specified
            information. Using this SEC data, we combine it with other
            third-party vendor financial information, and after an extensive
            organization process (laid out in our open-source codebase), we save
            the newly organized, insightful data in our database, before we
            serve it to you.
          </p>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-white-one">
            Through wallstreetlocal, SEC filings, which are usually raw webpages
            that contain a jumble of tables and labels, become useful,
            user-friendly pages, with all kinds of different analysis. We
            provide sorting, pagination, access to recent and historical prices,
            and even downloads of our own data through raw JSON or spreadsheets
            - this, along with many other features, come for free, with no
            strings attached.
          </p>
        </section>
      </main>
    </>
  );
}

About.getLayout = ({ Component, pageProps }) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);
