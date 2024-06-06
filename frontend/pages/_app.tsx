import "@/styles/globals.css";

import Layout from "components/Layouts/Layout";

interface AppProps {
  Component: React.ComponentType<any> & { getLayout?: (props: any) => JSX.Element };
  pageProps: any;
}

function App(props: AppProps): JSX.Element {
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);

  return getLayout(props);
}

export default App;