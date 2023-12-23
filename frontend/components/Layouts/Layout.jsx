import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Bar from "@/components/Bar/Bar";

import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }) {
  return (
    <>
      <Bar />
      <Navbar />
      <div>{children}</div>
      <Analytics />
      <Footer />
    </>
  );
}
