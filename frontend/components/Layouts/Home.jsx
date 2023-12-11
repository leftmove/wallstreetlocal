import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  return (
    <>
      <Navbar variant="home" />
      <div>{children}</div>
      <Analytics />
      <SpeedInsights />
      <Footer />
    </>
  );
}
