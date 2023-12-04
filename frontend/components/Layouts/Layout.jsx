import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: "15vh" }}>{children}</div>
      <Footer />
    </>
  );
}
