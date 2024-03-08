import "@/styles/globals.css";

import Layout from "@/components/Layouts/Layout";

function App(props) {
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);

  return getLayout(props);
}

export default App;
