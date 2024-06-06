import Navigation from "components/Navigation/Navigation";
import Footer from "components/Footer/Footer";
import { Analytics } from "@vercel/analytics/react";
import { ReactNode } from "react";
interface LayoutProps {
  children: ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navigation variant="home" />
      <div>{children}</div>
      <Analytics />
      <Footer />
    </>
  );
}