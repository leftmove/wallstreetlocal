import "@/styles/globals.css";

import Layout from "@/components/Layouts/Layout";
import MobileLayout from "@/components/Layouts/Mobile";

import { isMobile } from "react-device-detect";

// function App({ Component, pageProps, ...rest }) {
//   const customLayout = Component.getLayout
//     ? () => Component.getLayout(<Component {...pageProps} />)
//     : null;
//   const reduxLayout = Component.reduxLayout
//     ? () => {
//         const { store, props } = wrapper.useWrappedStore(rest);
//         return (
//           <Layout>
//             <Provider store={store}>
//               {<Component {...props.pageProps} />}
//             </Provider>
//           </Layout>
//         );
//       }
//     : null;
//   const defaultLayout = () => <Layout>{<Component {...pageProps} />}</Layout>;

//   if (customLayout) return customLayout();
//   if (reduxLayout) return reduxLayout();
//   return defaultLayout();
// }

// export default App;

function App(props) {
  const getLayout =
    props.Component.getLayout ||
    (() => <Layout>{<props.Component {...props.pageProps} />}</Layout>);
  if (isMobile) {
    return <MobileLayout />;
  }

  return getLayout(props);
}

export default App;
