import "styles/globals.css";
import "styles/fonts.css";

import Layout from "components/Layouts/Layout";
import Maintenance from "components/Maintenance/Maintenance";

function App(props) {
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);
  return getLayout(props);
}

export default App;
