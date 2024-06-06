import "@/styles/globals.css";

import Layout from "components/Layouts/Layout";

import { Inter } from "@next/font/google";

const font: Inter = Inter({ weight: "800", subsets: ["latin"] });
const fontBold: Inter = Inter({ weight: "900", subsets: ["latin"] });
const fontLight: Inter = Inter({ weight: "700", subsets: ["latin"] });

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
export { font, fontBold, fontLight };