import Head from "next/head";

import Progress from "components/Progress/Progress";
import Recommended from "components/Recommended/Recommended";

import { FC } from "react";

interface BuildingProps {
  cik?: string | null;
  persist: boolean;
}

const Building: FC<BuildingProps> = (props) => {
  const cik = props.cik || null;
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

export default Building;