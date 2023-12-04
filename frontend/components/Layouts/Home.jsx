import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar variant="home" />
      <div style={{ marginTop: "10vh" }}>{children}</div>
      <Footer />
    </>
  );
}
