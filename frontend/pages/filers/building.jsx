import Head from "next/head";
import Error from "next/error";

import Progress from "@/components/Progress/Progress";
import Recommended from "@/components/Recommended/Recommended";

const BuildingPage = (props) => {
  const cik = props.cik || null;

  if (cik == null) {
    return <Error statusCode={404} />;
  }

  const persist = props.persist;
  return (
    <>
      <Head>
        <title>Building...</title>
      </Head>
      <Progress cik={cik} persist={persist} />
      <Recommended />
    </>
  );
};

export default BuildingPage;
