import styles from "@/styles/Filer.module.css";
import { useEffect, useReducer, useState } from "react";

import axios from "axios";
// import useSWR from "swr/immutable";

import { useRouter } from "next/router";
import Error from "next/error";

import Table from "@/components/Table/Table";
import Loading from "@/components/Loading/Loading";
import Expand from "@/components/Expand/Expand";

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
//   // } = useSWR("/api/filers/query", postFetcher({ cik: cik }));

//   // const [infoData, setInfoData]: any = useState({});
//   // const res = axios
//   //   .get("/api/filers/info", { params: { cik: cik } })
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
//   // } = useSWR(["/api/filers/info", cik], ([url, cik]) => getFetcher(url, cik));

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
//     .get("/api/filers/info", { params: { cik: context.params.cik } })
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
// const url = "/api/filers/info";
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

const fetchWithCache = async (url, fetcher) => {
  const value = cacheData.get(url);
  if (value) {
    return value;
  } else {
    const hours = 24;
    const res = await fetch(url, options);
    const data = await res.json();
    cacheData.put(url, data, hours * 1000 * 60 * 60);
    return data;
  }
};

const Filer = () => {
  const router = useRouter();
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

    axios
      .get("/api/filers/query/", {
        params: {
          cik: cik,
        },
      })
      .then((res) => {
        if (res.status == 201 || res.status == 409) {
          setStatus({ building: true });
        }
      })
      .catch((e) => {
        console.error(e);
        if (e.response.status != 429) setStatus({ error: true });
      });

    axios
      .get("/api/filers/info", {
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
      });
  }, [router.isReady, cik]);

  if (status.error) return <Error statusCode={404} />;
  if (status.building)
    return (
      <div className={[styles["loading"], inter.className].join(" ")}>
        Building...
      </div>
    );
  if (status.loading) return <Loading />;

  return (
    <>
      <div className={styles["header"]}>
        <span className={[styles["main-header"], inter.className].join(" ")}>
          {filer.name}
        </span>
        <div
          className={[
            styles["sub-header"],
            expand ? styles["sub-header-expanded"] : "",
          ].join(" ")}
          onClick={() => setExpand(!expand)}
        >
          <div className={styles["secondary-header"]}>
            <span
              className={[
                styles["secondary-header-desc"],
                inter.className,
              ].join(" ")}
            >
              {filer.cik} ({filer.tickers.join(", ")})
            </span>
            <Expand onClick={() => setExpand(!expand)} />
          </div>
          <span className={[styles["header-desc"], inter.className].join(" ")}>
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
    </>
  );
};

export default Filer;
