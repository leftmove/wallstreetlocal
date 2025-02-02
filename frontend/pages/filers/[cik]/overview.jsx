import axios from "axios";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";

import Layout from "components/Layouts/Layout";
import Info from "components/Filer/Info";
import Other from "components/Filer/Other";
import Building from "components/Filer/Building";

const Filer = (props) => {
  const query = props.query;
  const cik = props.cik;

  const continuous = props.continuous;
  const persist = props.persist;
  const tab = props.tab;

  if ((query.ok || query.continuous || continuous) && persist === false) {
    // Better way to write/structure this?
    return <Info cik={cik} tab={tab} />;
  }

  if (query.building || persist) {
    return <Building cik={cik} persist={persist} />;
  }

  if (query.error || query === undefined) {
    return <Other />;
  }
};

export function validateStatus(status) {
  if (status === undefined) {
    throw Error("No status code provided");
  }

  const query = {
    ok: false,
    building: false,
    continuous: false,
    error: false,
  };

  switch (status) {
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

  return query;
}

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps(context) {
  const cik = context.query.cik || null;
  const continuous = context.query.continuous || false;
  const persist = context.query.persist === "true" ? true : false || false;
  const tab = context.query.tab || "stocks";

  const query = await axios
    .get(server + "/filers/query", {
      params: { cik },
      validateStatus: (status) => status < 500,
    })
    .then((r) => validateStatus(r?.status))
    .catch((e) => {
      console.error(e);
      return null;
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

Filer.getLayout = function getLayout({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { cik } = props.pageProps;
  const reduxStore = {
    ...store,
    filer: { ...store.filer, cik: cik },
    filing: { ...store.filing, cik: cik },
  };

  return (
    <Layout>
      <Provider store={reduxStore}>
        <Component {...props.pageProps} />
      </Provider>
    </Layout>
  );
};

export default Filer;
