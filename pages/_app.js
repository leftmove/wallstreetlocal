import "@/styles/globals.css";

import { Provider } from "react-redux";
import { wrapper } from "@/redux/store";

import Navbar from "@/components/Navbar/Navbar";

function App({ Component, ...rest }) {
  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    <>
      <Provider store={store}>
        <Navbar />
        <Component {...props.pageProps} />
      </Provider>
    </>
  );
}

export default App;
