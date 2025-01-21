import "styles/globals.css";
import "styles/fonts.css";

import Layout from "components/Layouts/Layout";
import Maintenance from "components/Maintenance/Maintenance";

import localFont from "@next/font/local";

const font = localFont({
  src: "../fonts/Switzer-Medium.woff2",
  style: "normal",
  variable: "--font-medium",
});
const fontBold = localFont({
  src: "../fonts/Switzer-Black.woff2",
  style: "normal",
  variable: "--font-bold",
});
const fontLight = localFont({
  src: "../fonts/Switzer-Light.woff2",
  style: "normal",
  variable: "--font-light",
});

function App(props) {
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);
  return getLayout(props);
}

export default App;
export { font, fontBold, fontLight };
