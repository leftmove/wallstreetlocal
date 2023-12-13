import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
      <Analytics />
      <Footer />
    </>
  );
}
