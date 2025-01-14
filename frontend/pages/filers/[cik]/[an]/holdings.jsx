import axios from "axios";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";

import { validateStatus } from "pages/filers/[cik]/overview";
import Layout from "components/Layouts/Layout";
import Info from "components/Filing/Info";
import Other from "components/Filer/Other";
import Building from "components/Filer/Building";

const Filing = (props) => {
  const query = props.query;
  const cik = props.cik;

  const continuous = props.continuous;
  const persist = props.persist;
  const tab = props.tab;

  if (query.ok || query.continuous || continuous) {
    return <Info cik={cik} tab={tab} />;
  }

  if (query.building || persist) {
    return <Building cik={cik} persist={persist} />;
  }

  if (query.error || query === undefined) {
    return <Other />;
  }
};

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps(context) {
  const cik = context.query.cik || null;
  const an = context.query.an || null;
  const continuous = context.query.continuous || false;
  const persist = context.query.persist === "true" ? true : false || false;
  const tab = context.query.tab || "stocks";

  const query = await axios
    .get(server + "/filing/query", {
      params: { cik, access_number: an },
      validateStatus: (status) => status < 500,
    })
    .then((r) => validateStatus(r?.status))
    .catch((e) => {
      console.error(e);
      return undefined;
    });

  return {
    props: {
      query,
      cik,
      an,
      tab,
      persist,
      continuous,
    },
  };
}

Filing.getLayout = function getLayout({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { cik, an: accessNumber } = props.pageProps;
  const reduxStore = {
    ...store,
    filer: { ...store.filer, cik: cik },
    filing: { ...store.filing, cik: cik, accessNumber: accessNumber },
  };

  return (
    <Layout>
      <Provider store={reduxStore}>
        <Component {...props.pageProps} />
      </Provider>
    </Layout>
  );
};

export default Filing;
