import axios from "axios";
import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";
import Layout from "components/Layouts/Layout";
import Info from "components/Filer/Info";
import Other from "components/Filer/Other";
import Building from "components/Filer/Building";
import { GetServerSideProps } from "next";
import { FC } from "react";
interface Query {
  ok: boolean;
  building: boolean;
  continuous: boolean;
  error: boolean;
}
interface FilerProps {
  query: Query;
  cik: string | null;
  continuous: boolean | null;
  persist: boolean | null;
  tab: string;
}
const Filer: FC<FilerProps> = (props) => {
  const query = props.query;
  const cik = props.cik;
  const continuous = props.continuous;
  const persist = props.persist;
  const tab = props.tab;
  console.log(cik);
  if (query.building || persist) {
    return <Building cik={cik} persist={persist} />;
  }
  if (query.ok || query.continuous || continuous) {
    return <Info cik={cik} tab={tab} />;
  }
  if (query.error) {
    return <Other />;
  }
};
const server = process.env.NEXT_PUBLIC_SERVER;
export const getServerSideProps: GetServerSideProps = async (context) => {
  const cik = context.query.cik || null;
  const continuous = context.query.continuous || null;
  const persist = context.query.persist || null;
  const tab = context.query.tab || "stocks";
  const query: Query = {
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
};
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