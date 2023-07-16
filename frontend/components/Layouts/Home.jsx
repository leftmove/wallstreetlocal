import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar variant="home" />
      <div style={{ marginTop: "3.5vw" }}>{children}</div>
      <Footer />
    </>
  );
}
