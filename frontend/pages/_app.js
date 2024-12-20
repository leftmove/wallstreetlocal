import "@/styles/globals.css";

import Layout from "components/Layouts/Layout";
import Maintenance from "components/Maintenance/Maintenance";

import { Inter } from "@next/font/google";

const font = Inter({ weight: "800", subsets: ["latin"] });
const fontBold = Inter({ weight: "900", subsets: ["latin"] });
const fontLight = Inter({ weight: "700", subsets: ["latin"] });

function App(props) {
  return <Maintenance />;
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);
  return getLayout(props);
}

export default App;
export { font, fontBold, fontLight };
