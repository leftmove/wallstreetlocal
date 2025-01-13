import axios from "axios";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";

import Layout from "components/Layouts/Layout";

const Filing = (props) => {};

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps(context) {
  const an = context.query.an || null;
  const continuous = context.query.continuous || false;
  const persist = context.query.persist === "true" ? true : false || false;
  const tab = context.query.tab || "stocks";

  const query = {
    ok: false,
    building: false,
    continuous: false,
    error: false,
  };

  await axios
    .get(server + "/filers/query", {
      params: { cik },
      validateStatus: (status) => status < 500,
    })
    .then((r) => {
      switch (r?.status) {
        case 302:
          query.continuous = true;
          break;
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
      tab,
      persist,
      continuous,
    },
  };
}

Filing.getLayout = function getLayout({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { an } = props.pageProps;
  const reduxStore = { ...store, filer: { ...store.filer, an } };

  return (
    <Layout>
      <Provider store={reduxStore}>
        <Component {...props.pageProps} />
      </Provider>
    </Layout>
  );
};

export default Filing;
