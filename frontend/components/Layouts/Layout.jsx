import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: "5vw" }}>{children}</div>
      <Footer />
    </>
  );
}
