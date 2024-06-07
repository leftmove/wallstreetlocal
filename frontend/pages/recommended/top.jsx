import styles from "styles/Recommended.module.css";

import Link from "next/link";

import axios from "axios";

import Reccomended from "components/Recommended/Recommended";

const title = "Top Filers";
const description = (
  <span className={styles["description-text"]}>
    The following contains links and information for{" "}
    <span className={styles["description-link"]}>
      <Link
        href="https://en.wikipedia.org/wiki/List_of_asset_management_firms"
        target="_blank"
      >
        the top investing firms
      </Link>
    </span>{" "}
    in America, sorted by market value.
  </span>
);
const source =
  "https://gist.github.com/leftmove/1e96a95bad8e590a440e37f07d305d2a";

const Top = (props) => {
  return (
    <Reccomended
      title={title}
      description={description}
      source={source}
      {...props}
    />
  );
};

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps() {
  const data = await axios
    .get(server + "/filers/top")
    .then((r) => r.data)
    .catch((e) => console.log(e));
  const filers = data?.filers || [];
  return {
    props: {
      filers,
    },
  };
}

export default Top;
