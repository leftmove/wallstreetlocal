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

export default function Home(props) {
  return (
    <>
      <main className="flex flex-col p-2 overflow-hidden border-t-2 border-opacity-50 min-h-[100vh] sm:flex-row sm:justify-between bg-black-two border-black-three font-switzer ">
        <section className="relative flex flex-col justify-center w-full h-full p-10 sm:w-1/2 ">
          <h1 className="flex-wrap w-full text-4xl font-bold text-center sm:text-left text-offwhite-one md:text-6xl lg:text-8xl">
            Learn from the world's biggest investors.
          </h1>
          <p className="flex flex-col justify-between w-full mt-10 font-semibold md:text-lg text-green-one ">
            Open investment research, for everyone.
            <br />
            Browse thousands of holdings, reports, and prices, straight from the
            SEC.
          </p>
          <div className="flex flex-col items-center justify-center w-full mt-10 mb-10 md:flex-row md:items-center">
            <MainButton
              className="w-full md:w-48"
              onClick={() => window.open("/examples", "_self")}
            >
              See Examples
            </MainButton>
            <SideButton className="w-full mt-4 md:mt-0 md:ml-4 md:w-48">
              Coming Soon
            </SideButton>
          </div>
          {/* <div className="flex justify-end w-full">
            <Search className="justify-end w-1/2 mt-4" />
          </div>   */}
        </section>
        <section className="flex flex-col items-center justify-center w-full h-full p-10 md:mt-10 lg:mt-16 sm:w-1/2 sm:p-10">
          <Search className="w-2/3 font-semibold lg:w-full bg-white-one" />
          <div className="relative flex flex-col items-center w-full mt-5 h-96">
            <Example
              {...examples.at(0)}
              className="absolute top-0 z-30 hover:top-2"
            />
            <Example
              {...examples.at(1)}
              className="absolute z-20 scale-95 hover:z-40 hover:top-12 top-10"
            />
            <Example
              {...examples.at(2)}
              className="absolute z-10 scale-90 hover:z-40 hover:top-28 top-24"
            />
          </div>
        </section>
        {/* <Example {...examples.at(0)} /> */}
        {/* <div className="relative flex flex-col w-full h-full ml-auto">
            <Example {...examples.at(2)} className="absolute top-0 right-0" />
            <Example {...examples.at(1)} className="absolute top-24 right-4" />
            <Example {...examples.at(0)} className="absolute top-44 right-8" />
          </div> */}
      </main>
      {/* Stuff generated by AI that I probably don't need. Some useful information, nonetheless. Might be worth to keep. */}
      {/* <section className="h-[80vh] font-switzer bg-offwhite-one px-8 py-16 lg:px-16 flex items-center">
        <div className="grid gap-16 mx-auto max-w-7xl lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold text-black-one">
              Introduction to the SEC
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-black-two">
              <p>
                The Securities and Exchange Commission (SEC) keeps a record of
                every company in the United States. Companies whose valuations
                surpass a certain threshold though, are required to file some
                special forms. These forms, usually filed quarterly, can
                disclose the filer's holdings, update investors on current
                strategy, and provide all kinds of other useful financial data.
              </p>
              <p>
                With the purpose being to level the playing field for all
                investors, required SEC filings makes America's largest
                companies provide transparency. The problem though, is that
                these holdings are often cumbersome to access, and valuable
                analysis is often hidden behind a paywall. Through
                wallstreetlocal, the SEC's filing system becomes more accessible
                and open.
              </p>
            </div>
            <BottomButton
              className="mt-8"
              onClick={() =>
                window.open(
                  "https://www.investopedia.com/articles/fundamental-analysis/08/sec-forms.asp",
                  "_blank"
                )
              }
            >
              Learn More About SEC Filings
            </BottomButton>
          </div>
          <div className="grid content-center grid-cols-2 gap-6">
            <div className="p-8 transition-transform border-2 bg-white-one rounded-xl border-black-three hover:scale-105">
              <FileText className="w-12 h-12 mb-4 text-green-three" />
              <h3 className="mb-3 text-xl font-bold">Quarterly Reports</h3>
              <p className="text-black-two">
                Access detailed financial statements and holdings
              </p>
            </div>
            <div className="p-6 transition-transform border-2 rounded-lg bg-white-one border-black-three hover:scale-105">
              <Magnify className="w-12 h-12 mb-4 text-green-three" />
              <h3 className="mb-2 text-xl font-bold">Easy Search</h3>
              <p className="text-black-two">
                Find exactly what you're looking for quickly
              </p>
            </div>
            <div className="p-6 transition-transform border-2 rounded-lg bg-white-one border-black-three hover:scale-105">
              <TrendingUp className="w-12 h-12 mb-4 text-green-three" />
              <h3 className="mb-2 text-xl font-bold">Market Analysis</h3>
              <p className="text-black-two">
                Track market trends and company performance
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="h-[80vh] font-switzer bg-black-two px-8 py-16 lg:px-16 flex items-center text-offwhite-one">
        <div className="grid gap-16 mx-auto max-w-7xl lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">What We Do</h2>
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                When you query a filer on wallstreetlocal, we go through our
                latest dump of the SEC's search database, and query the
                specified information. Using this SEC data, we combine it with
                other third-party vendor's financial information, and after an
                extensive organization process (laid out in our open-source
                codebase), we save the newly organized, insightful data in our
                database, before we serve it to you.
              </p>
              <p>
                Through wallstreetlocal, SEC filings, which are usually raw
                webpages that contain a jumble of tables and labels, become
                useful, user-friendly pages, with all kinds of different
                analysis. We provide sorting, pagination, access to recent and
                historical prices, and even downloads of our own data through
                raw JSON or spreadsheets - this, and many other features, come
                totally for free, with no strings attached.
              </p>
            </div>
            <div className="flex space-x-4">
              <MainButton>View Documentation</MainButton>
              <SideButton>GitHub Repository</SideButton>
            </div>
          </div>
          <div className="space-y-8">
            <div className="p-6 transition-transform border-2 bg-black-one rounded-xl border-green-three hover:scale-105">
              <Database className="w-8 h-8 mb-4 text-green-three" />
              <h3 className="mb-3 text-xl font-bold">Data Processing</h3>
              <p>Converting raw SEC data into accessible formats</p>
            </div>
            <div className="p-6 transition-transform border-2 bg-black-one rounded-xl border-green-three hover:scale-105">
              <BarChart className="w-8 h-8 mb-4 text-green-three" />
              <h3 className="mb-3 text-xl font-bold">Analysis Tools</h3>
              <p>Advanced sorting, filtering, and visualization tools</p>
            </div>
            <div className="p-6 transition-transform border-2 bg-black-one rounded-xl border-green-three hover:scale-105">
              <Download className="w-8 h-8 mb-4 text-green-three" />
              <h3 className="mb-3 text-xl font-bold">Free Downloads</h3>
              <p>Export data in JSON or spreadsheet formats</p>
            </div>
          </div>
        </div>
      </section> */}
    </>
  );
}

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps() {
  const health = await axios
    .get(server + "/health")
    .then((r) => r.status === 200)
    .then(() => true)
    .catch(() => false);
  return {
    props: {
      health,
    },
  };
}

Home.getLayout = ({ Component, pageProps }) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);
