import Head from "next/head";
import Error from "next/error";
import { FC } from "react";
enum StatusCode {
  NotFound = 404,
}
const Other: FC = () => {
  return (
    <>
      <Head>
        <title>404 - Filer not found</title>
      </Head>
      <Error statusCode={StatusCode.NotFound} />
    </>
  );
};
export default Other;