"use server";

import styles from "@/styles/Home.module.css";

import axios from "axios";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { font, fontLight, fontBold } from "fonts";
import { cn } from "components/ui/utils";

import Layout from "components/Layouts/Home";
import Search from "components/Search/Homepage/Search";
import Suggested from "components/Suggested/Suggested";
import Health from "components/Health/Health";
import Hero from "@/images/hero.jpg";

// SEO terms taken from SEMrush
const keywords =
  "13f, 13f filings, berkshire hathaway, warren buffet, micheal burry, pershing square, citadel, melvin capital";
const examples = [
  {
    name: "Berkshire Hathaway",
    people: ["Warren Buffet"],
    cik: "1067983",
    tickers: ["BRK-A", "BRK-B"],
    date: new Date("9/30/2024").toLocaleDateString(),
    marketValue: 266_378_900_503,
    topHoldings: ["AAPL", "BAC", "KO"],
    holdings: [
      {
        ticker: "AAPL",
        marketValue: 69_900_000_000,
        percentPortfolio: 0.26,
      },
      {
        ticker: "BAC",
        marketValue: 41_116_821_840,
        percentPortfolio: 0.15,
      },
      {
        ticker: "ALLY",
        marketValue: 1_032_110_000,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AMZN",
        marketValue: 1_863_300_000,
        percentPortfolio: 0.01,
      },
      {
        ticker: "AON",
        marketValue: 1_418_559_000,
        percentPortfolio: 0.01,
      },
      {
        ticker: "AXP",
        marketValue: 41_116_821_840,
        percentPortfolio: 0.15,
      },
    ],
  },
  {
    name: "Vanguard Group",
    people: [],
    cik: "102909",
    tickers: [],
    date: new Date("9/29/2024").toLocaleDateString(),
    marketValue: 5_584_478_889_705,
    topHoldings: ["AAPL", "MSFT", "NVDA"],
    holdings: [
      {
        ticker: "A",
        marketValue: 4966479309,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AA",
        marketValue: 995892894,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AADI",
        marketValue: 1577944,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AAL",
        marketValue: 697236961,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AAME",
        marketValue: 150520,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AAN",
        marketValue: 17302323,
        percentPortfolio: "N/A",
      },
    ],
  },
  {
    name: "Tiger Global Management LLC",
    people: ["Chase Coleman", "Scott Shleifer"],
    cik: "1167483",
    tickers: [],
    date: new Date("9/29/2024").toLocaleDateString(),
    marketValue: 23_439_074_898,
    topHoldings: ["META", "MSFT", "GOOGL"],
    holdings: [
      {
        ticker: "AMAT",
        marketValue: 180875160,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AMZN",
        marketValue: 1195397879,
        percentPortfolio: 0.05,
      },
      {
        ticker: "APO",
        marketValue: 1534543458,
        percentPortfolio: 0.07,
      },
      {
        ticker: "ARM",
        marketValue: 42903000,
        percentPortfolio: "N/A",
      },
      {
        ticker: "AVGO",
        marketValue: 318348750,
        percentPortfolio: 0.01,
      },
      {
        ticker: "CPAY",
        marketValue: 390192183,
        percentPortfolio: 0.02,
      },
    ],
  },
];

function Example({
  name,
  people,
  date,
  cik,
  tickers,
  marketValue,
  topHoldings,
  holdings,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col z-10 hover:scale-105 transition-all duration-100 ease-in-out hover:z-20 w-3/5 p-4 rounded-md bg-black-two",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Link href={`/filers/${cik}/overview`}>
          <h3 className="text-lg font-bold text-green-one text-wrap">{name}</h3>
        </Link>
        <span className="hidden text-sm text-offwhite-one md:block">
          {date}
        </span>
        <Link href={`/filers/${cik}/overview`}>
          <span className="text-sm text-offwhite-one">{cik}</span>
        </Link>
      </div>
      <div className="flex justify-between">
        <p className="text-sm text-offwhite-one">{people.join(", ")}</p>
        <p className="text-sm text-offwhite-one">{tickers.join(", ")}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-sm text-wrap text-offwhite-one">
          ${marketValue.toLocaleString()}
        </p>
        <p className="hidden text-sm text-offwhite-one md:block">
          {topHoldings.join(", ")}
        </p>
      </div>
      <div className="w-full mt-6 overflow-x-auto">
        <table className="w-full border-[3px] rounded bg-offwhite-one border-black-one">
          <thead className="font-mono text-xs text-black-one">
            <tr>
              <th className="border-2 border-opacity-30 border-black-one">
                Ticker
              </th>
              <th className="border-2 border-opacity-30 border-black-one">
                Market Value
              </th>
              <th className="border-2 border-opacity-30 border-black-one">
                % Portfolio
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm text-center text-black-one">
            {holdings.map(({ ticker, marketValue, percentPortfolio }) => (
              <tr key={ticker}>
                <td className="border-2 border-opacity-30 border-black-one">
                  {ticker}
                </td>
                <td className="border-2 border-opacity-30 border-black-one">
                  ${marketValue.toLocaleString()}
                </td>
                <td className="border-2 border-opacity-30 border-black-one">
                  {percentPortfolio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home(props) {
  return (
    <>
      <main className="flex justify-between p-2 font-switzer">
        <section className="w-1/2">
          <Search />
          <h1>Open investing research</h1>
        </section>
        <section className="w-full">
          <div className="relative w-full -">
            <Example {...examples.at(2)} className="absolute right-0 top-4" />
            <Example {...examples.at(1)} className="absolute top-28 right-4" />
            <Example {...examples.at(0)} className="absolute top-48 right-8" />
          </div>
        </section>
      </main>
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
