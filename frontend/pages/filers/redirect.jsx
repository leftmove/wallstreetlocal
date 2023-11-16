import styles from "@/styles/Filer.module.css";
import { useEffect } from "react";

import { redirect } from "next/navigation";
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"], weight: "700" });

import useEllipsis from "@/components/Hooks/useEllipsis";

const Redirect = (props) => {
  const cik = props.cik;
  const wait = props.wait || 1000;

  const { ellipsis } = useEllipsis();
  useEffect(() => {
    setTimeout(() => {
      redirect("/filers/" + cik);
    }, props.delay || wait);
  }, []);

  return (
    <div className={styles["reload"]}>
      <span className={[styles["reload-text"], inter.className].join(" ")}>
        Reloading Page {ellipsis}
      </span>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { cik, wait } = context.query;
  return {
    props: { cik, wait },
  };
}

export default Redirect;
