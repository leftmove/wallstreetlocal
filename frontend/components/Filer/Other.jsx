import Head from "next/head";
import Error from "next/error";

const Other = () => {
  return (
    <>
      <Head>
        <title>404 - Filer not found</title>
      </Head>
      <Error statusCode={404} />
    </>
  );
};

export default Other;
