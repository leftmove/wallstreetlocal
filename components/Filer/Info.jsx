"use server";

import Head from "next/head";

import Tabs from "@/components/Tabs/Tabs";
import Index from "@/components/Index/Index";
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
  const tab = props.tab || "recent";
  const titleText = `Filers - ${cik}`;

  return (
    <>
      <Head>
        <title>{titleText}</title>
      </Head>
      <Header cik={cik} tab={tab} />
      {/* <Tabs /> */}
      {tab == "historical" ? <Explorer /> : null}
      {/* {tab == "recent" ? <Index /> : null} */}
    </>
  );
};

export { convertTitle };
export default Info;
