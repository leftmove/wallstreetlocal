import styles from "@/styles/Filer.module.css";
import { useEffect, useReducer, useState } from "react";

import axios from "axios";
import { SWRConfig } from "swr";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setCik } from "@/redux/filerSlice";

import { useRouter } from "next/router";
import Head from "next/head";
import Error from "next/error";

import Layout from "@/components/Layouts/Layout";
import Table from "@/components/Table/Table";
import Loading from "@/components/Loading/Loading";
import Expand from "@/components/Expand/Expand";
import Progress from "@/components/Progress/Progress";
import Recommended from "@/components/Recommended/Filer/Recommended";

import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "900" });

// const getFetcher = (url, cik) =>
//   axios
//     .get(
//       url,
//       { params: { cik: cik } },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "Token",
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     )
//     .then((r) => {
//       if (r.status == 201) {
//         const error = new Error("Filer building.");
//         error.info = r.data;
//         error.status = 201;

//         throw error;
//       }

//       return r.data;
//     })
//     //    .catch((e) => console.error(e));
//     .catch((e) => console.log("Ignore"));

//   // const {
//   //   data: queryData,
//   //   error: queryError,
//   //   loading: queryLoading,
//   // } = useSWR("https://content.wallstreetlocal.com/filers/query", postFetcher({ cik: cik }));

//   // const [infoData, setInfoData]: any = useState({});
//   // const res = axios
//   //   .get("https://content.wallstreetlocal.com/filers/info", { params: { cik: cik } })
//   //   .then((res) => console.log(res))
//   //   .then((data) => {
//   //     setInfoData(data);
//   //     console.log(data);
//   //   })
//   //   .catch((e) => console.error(e));

//   // if (queryError || queryLoading) {
//   //   console.log(queryError);
//   //   return (
//   //     <div className={styles["loading"] + " " + inter.className}>
//   //       Loading...
//   //     </div>
//   //   );
//   // }

//   // if (res.status == 102) {
//   //   return (
//   //     <div className={styles["loading"] + " " + inter.className}>
//   //       Building...
//   //     </div>
//   //   );
//   // }

//   // const {
//   //   data: infoData,
//   //   error: infoError,
//   //   isLoading: infoLoading,
//   // } = useSWR(["https://content.wallstreetlocal.com/filers/info", cik], ([url, cik]) => getFetcher(url, cik));

//   // if (infoLoading || !infoData) {
//   //   return <Loading />;
//   // }

//   // if (infoError) {
//   //   if ((infoError.status = 201 || infoError.status == 409)) {
//   //     return (
//   //       <div className={[styles["loading"], inter.className].join(" ")}>
//   //         Building...
//   //       </div>
//   //     );
//   //   } else {
//   //     return (
//   //       <div className={[styles["loading"], inter.className].join(" ")}>
//   //         <Error statusCode={404} />
//   //       </div>
//   //     );
//   //   }
//   // }

// if (infoError) {
//   if ((infoError.status = 201 || infoError.status == 409)) {
//     return (
//       <div className={[styles["loading"], inter.className].join(" ")}>
//         Building...
//       </div>
//     );
//   } else {
//     return (
//       <div className={[styles["loading"], inter.className].join(" ")}>
//         <Error statusCode={404} />
//       </div>
//     );
//   }
// }
// export async function getStaticProps(context) {
//   const props = {};
//   axios
//     .get("https://content.wallstreetlocal.com/filers/info", { params: { cik: context.params.cik } })
//     .then((res) => {
//       if (res.status == 201 || res.status == 409) {
//         props.status = "building";
//       }
//       return res.data;
//     })
//     .then((data) => {
//       props.filer = data.filer;
//       props.status = "ok";
//     })
//     .catch((e) => {
//       console.error(e);
//       props.status = "error";
//     });

//   return {
//     props: props,
//   };
// }
// const url = "https://content.wallstreetlocal.com/filers/info";
// fetchWithCache(url, () => {
//   setStatus({ loading: true });
//   axios
//     .get(url, { params: { cik: cik } })
//     .then((res) => res.data)
//     .then((data) => {
//       setFiler(data.filer);
//     })
//     .catch((e) => {
//       console.error(e);
//       setStatus({ error: true });
//     });
// });

// const fetchWithCache = async (url, fetcher) => {
//   const value = cacheData.get(url);
//   if (value) {
//     return value;
//   } else {
//     const hours = 24;
//     const res = await fetch(url, options);
//     const data = await res.json();
//     cacheData.put(url, data, hours * 1000 * 60 * 60);
//     return data;
//   }
// };

const Filer = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [filer, setFiler] = useState({});
  const [status, setStatus] = useReducer(
    (prev, next) => {
      prev.building = prev.loading = prev.error = false;
      return { ...prev, ...next };
    },
    {
      loading: true,
      building: false,
      error: false,
    }
  );
  const { cik } = router.query;

  const [expand, setExpand] = useState(false);
  useEffect(() => {
    if (router.isReady === false) return;

    dispatch(setCik(cik));
    axios
      .get("https://content.wallstreetlocal.com/filers/query/", {
        params: {
          cik: cik,
        },
      })
      .then((res) => {
        if (res.status == 201) {
          setStatus({ building: true });
          throw Error("Building...");
        }
      })
      .then(() =>
        axios
          .get("https://content.wallstreetlocal.com/filers/info", {
            params: {
              cik: cik,
            },
          })
          .then((res) => res.data)
          .then((data) => {
            setFiler(data.filer);
            setStatus({ loading: false });
          })
          .catch((e) => {
            console.error(e);
            setStatus({ error: true });
          })
      )
      .catch((e) => {
        console.error(e);
        if (e.response && e.response.status != 429) setStatus({ error: true });
        if (e.response && e.response.status == 409)
          setStatus({ building: true });
        return;
      });
  }, [router.isReady, cik, dispatch]);

  if (status.building) {
    return (
      <>
        <Head>
          <title>Building</title>
        </Head>
        <Progress cik={cik} />
        <Recommended />
      </>
    );
  } else if (status.loading) {
    return (
      <>
        <Head>
          <title>Loading</title>
        </Head>
        <Loading />
      </>
    );
  } else if (status.error || filer === {}) {
    return (
      <>
        <Head>
          <title>Error 404 - Filer not found</title>
        </Head>
        <Error statusCode={404} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Filers - {filer.name}</title>
      </Head>
      <SWRConfig value={{ provider: () => new Map() }}>
        <div className={styles["header"]}>
          <span className={[styles["main-header"], inter.className].join(" ")}>
            {filer.name}
          </span>
          <div
            className={[
              styles["sub-header"],
              expand ? styles["sub-header-expanded"] : "",
            ].join(" ")}
          >
            <div className={styles["secondary-header"]}>
              <span
                className={[
                  styles["secondary-header-desc"],
                  inter.className,
                ].join(" ")}
              >
                {filer.cik}{" "}
                {filer.tickers || [] ? `(${filer.tickers.join(", ")})` : ""}
              </span>
              <Expand onClick={() => setExpand(!expand)} expandState={expand} />
            </div>
            <span
              className={[styles["header-desc"], inter.className].join(" ")}
            >
              {filer.data.description}
            </span>
          </div>

          {/* <span className={[styles["sub-desc"], inter.className].join(" ")}>
        {filer.data["Description"]}
      </span> */}
        </div>
        <Table cik={cik} />
        <div className={styles["header"]}>
          {/* <span className={[styles["main-header"], inter.className].join(" ")}>
          Info
        </span> */}
        </div>
      </SWRConfig>
    </>
  );
};

Filer.getLayout = ({ Component, ...rest }) => {
  const { store, props: reduxProps } = wrapper.useWrappedStore(rest);
  return (
    <Layout>
      <Provider store={store}>
        {<Component {...reduxProps.pageProps} />}
      </Provider>
    </Layout>
  );
};

export default Filer;
