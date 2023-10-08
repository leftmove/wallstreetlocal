import axios from "axios";

const TopFilers = (props) => {
  return (
    <>
      <Head>
        <title>Top Filers</title>
      </Head>
      <div className={styles["header"]}>
        <div className={styles["main-header"]}>
          <span
            className={[styles["main-header-text"], inter.className].join(" ")}
          >
            Top Filers
          </span>
        </div>
      </div>
    </>
  );
};

const server = process.env.NEXT_PUBLIC_SERVER_URL;
export async function getServerSideProps() {
  const data = await axios
    .get(server + "/api/filers/top")
    .then((r) => r.data)
    .catch((e) => console.log(e));
  return {
    props: {
      filers: data.filers,
    },
  };
}

export default TopFilers;
