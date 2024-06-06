import Navigation from "components/Navigation/Navigation";
import Footer from "components/Footer/Footer";
import { Analytics } from "@vercel/analytics/react";
import React, { ReactNode } from "react";
interface LayoutProps {
  children: ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navigation />
      <div>{children}</div>
      <Analytics />
      <Footer />
    </>
  );
}