"use server";

import styles from "@/styles/Home.module.css";

import axios from "axios";

import Head from "next/head";
import Image from "next/image";

import { font, fontLight, fontBold } from "@fonts";

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
    ticker: ["BRK-A", "BRK-B"],
    marketValue: 300_000_000,
    topHoldings: ["AAPL", "BAC", "KO"],
    holdings: [],
  },
];

function Example({ name, people, cik, ticker, marketValue, topHoldings }) {
  return (
    <div className="flex flex-col w-3/4 p-4 rounded-md bg-black-two">
      <div className="flex items-center">
        <h3 className="text-lg font-bold text-green-one">{name}</h3>
        <span className="mx-2 text-sm text-offwhite-one"> • </span>
        <span className="text-sm text-offwhite-one">{cik}</span>
      </div>
      <div className="flex">
        <p className="text-sm text-offwhite-one">{people.join(", ")}</p>
        <p className="mx-2 text-sm text-offwhite-one"> • </p>
        <p className="text-sm text-offwhite-one">{ticker.join(", ")}</p>
      </div>
      <p className="text-sm text-offwhite-one">
        ${marketValue.toLocaleString()}
      </p>
      <p className="text-sm text-offwhite-one">{topHoldings.join(", ")}</p>
    </div>
  );
}

export default function Home(props) {
  return (
    <>
      <main className="p-4 font-switzer">
        <section className="w-1/2">
          <Example {...examples.at(0)} />
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
