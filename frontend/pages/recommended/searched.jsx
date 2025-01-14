import styles from "styles/Recommended.module.css";

import axios from "axios";

import Recommended from "components/Recommended/Recommended";

const title = "Searched Filers";
const description = (
  <span className={styles["description-text"]}>
    The following contains links and information for the most popular 13F
    filers, sorted by market value.
  </span>
);
const source =
  "https://gist.github.com/leftmove/daca5d470c869e9d6f14c298af809f9f";

const Searched = (props) => {
  return (
    <Recommended
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
    .get(server + "/filers/searched")
    .then((r) => r.data)
    .catch((e) => console.error(e));
  const filers = data?.filers || [];
  return {
    props: {
      filers,
    },
  };
}

export default Searched;
