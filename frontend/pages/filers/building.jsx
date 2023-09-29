import Head from "next/head";

import Progress from "@/components/Progress/Progress";
import Recommended from "@/components/Recommended/Filer/Recommended";

const BuildingPage = (props) => {
  const cik = props.cik;
  return (
    <>
      <Head>
        <title>Building...</title>
      </Head>
      <Progress cik={cik} />
      <Recommended />
    </>
  );
};

export default BuildingPage;
