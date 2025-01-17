import styles from "@/styles/Filer.module.css";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { fontLight } from "@fonts";

import useEllipsis from "components/Hooks/useEllipsis";

const Redirect = (props) => {
  const cik = props.cik;
  const url = props.url || (cik ? "/filers/" + cik + "/overview" : "");
  const delay = props.delay || null;
  const wait = props.wait || 1000;

  const router = useRouter();
  const { ellipsis } = useEllipsis();
  useEffect(() => {
    setTimeout(() => {
      if (url) {
        router.push(url + "?continuous=true");
      }
    }, delay || wait);
  }, [url]);

  return (
    <div className={styles["reload"]}>
      <span className={[styles["reload-text"], fontLight.className].join(" ")}>
        Redirecting {ellipsis}
      </span>
      <span className={[styles["reload-hint"], fontLight.className].join(" ")}>
        Reload this page manually if redirecting takes too long.
      </span>
    </div>
  );
};

export async function getServerSideProps(context) {
  const cik = context.query.cik || null;
  const wait = context.query.wait || 1000;
  const url = context.resolvedUrl || null;
  return {
    props: { cik, url, wait },
  };
}

export default Redirect;
