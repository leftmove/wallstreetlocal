import axios from "axios";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";

import Layout from "@/components/Layouts/Layout";
import Info from "@/components/Filer/Info";
import Other from "@/components/Filer/Other";
import Building from "@/components/Filer/Building";

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
//   // } = useSWR(server + "/filers/query", postFetcher({ cik: cik }));

//   // const [infoData, setInfoData]: any = useState({});
//   // const res = axios
//   //   .get(server + "/filers/info", { params: { cik: cik } })
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
//   // } = useSWR([server + "/filers/info", cik], ([url, cik]) => getFetcher(url, cik));

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
//     .get(server + "/filers/info", { params: { cik: context.params.cik } })
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
// const url = server + "/filers/info";
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

const Filer = (props) => {
  const query = props.query;
  const cik = props.cik;
  const persist = props.persist;

  if (query.building || persist) {
    return <Building cik={cik} persist={persist} />;
  }

  if (query.ok) {
    return <Info cik={cik} />;
  }

  if (query.error) {
    return <Other />;
  }
};

export async function getServerSideProps(context) {
  const cik = context.query.cik;
  const persist = context.query.persist;
  const server = process.env.NEXT_PUBLIC_SERVER;

  const query = {
    ok: false,
    building: false,
    error: false,
  };

  await axios
    .get(server + "/filers/query", { params: { cik: cik } })
    .then((r) => {
      switch (r?.status) {
        case 201:
        case 409:
          query.building = true;
          break;
        case 200:
          query.ok = true;
          break;
        default:
          query.error = true;
          break;
      }
    })
    .catch((e) => {
      console.error(e);
      query.error = true;
    });

  return {
    props: {
      query,
      cik,
      persist: persist || null,
    },
  };
}

Filer.getLayout = function getLayout({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { cik } = props.pageProps;
  const reduxStore = { ...store, filer: { ...store.filer, cik: cik } };

  return (
    <Layout>
      <Provider store={reduxStore}>
        <Component {...props.pageProps} />
      </Provider>
    </Layout>
  );
};

export default Filer;
