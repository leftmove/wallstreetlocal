"use server";

import Head from "next/head";

import Tabs from "@/components/Tabs/Tabs";
import Table from "@/components/Table/Table";
import Explorer from "@/components/Explorer/Explorer";
import Header from "@/components/Header/Header";

const convertTitle = (d) => {
  if (d) {
    d = d.replace(
      /(^\w|\s\w)(\S*)/g,
      (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
    );
    ["LLC", "LP", "L.P.", "LLP"].forEach((word) => {
      d = d.replace(
        word.at(0).toUpperCase() + word.toLowerCase().slice(1),
        word
      );
    });
  }
  return d;
};

const Info = (props) => {
  const cik = props.cik || null;

  return (
    <>
      <Head>
        <title>Filers - {cik}</title>
      </Head>
      <Header cik={cik} />
      <Tabs />
      <Explorer />
      <Table />
    </>
  );
};

export { convertTitle };
export default Info;
