import styles from "@/styles/Filer.module.css";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { fontLight } from "@fonts";

import useEllipsis from "@/components/Hooks/useEllipsis";

const Redirect = (props) => {
  const cik = props.cik || null;
  const wait = props.wait || 1000;

  const router = useRouter();
  const { ellipsis } = useEllipsis();
  useEffect(() => {
    setTimeout(() => {
      router.push("/filers/" + cik);
    }, props.delay || wait);
  }, []);

  return (
    <div className={styles["reload"]}>
      <span className={[styles["reload-text"], fontLight.className].join(" ")}>
        Redirecting {ellipsis}
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
