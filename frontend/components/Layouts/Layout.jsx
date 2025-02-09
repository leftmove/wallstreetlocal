import Navigation from "components/Navigation/Navigation";
import Footer from "components/Footer/Footer";
import Providers from "components/Providers/Providers";

import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }) {
  return (
    <>
      <Navigation />
      <Providers>{children}</Providers>
      <Analytics />
      <Footer />
    </>
  );
}
