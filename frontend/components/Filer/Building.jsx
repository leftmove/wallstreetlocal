import Head from "next/head";

import Progress from "components/Progress/Progress";
import Suggested from "components/Suggested/Suggested";

const Building = (props) => {
  const cik = props.cik || null;
  const persist = props.persist;
  return (
    <>
      <Head>
        <title>Building...</title>
      </Head>
      <Progress cik={cik} persist={persist} />
      <Suggested />
    </>
  );
};

export default Building;
