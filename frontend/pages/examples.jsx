import styles from "styles/Recommended.module.css";
import { useState } from "react";

import Link from "next/link";

import axios from "axios";

import { cn } from "components/ui/utils";

import Recommended from "components/Recommended/Recommended";
import Button from "components/Buttons/Secondary";

const Examples = (props) => {
  const [selected, setSelected] = useState("searched");
  return (
    <main className="flex flex-col bg-offwhite-one">
      <section className="flex justify-center w-full p-4">
        <Button
          onClick={() => setSelected("searched")}
          className={cn(
            "border-r-0 rounded-r-none w-36",
            selected === "searched" &&
              "bg-white-one !text-black-one hover:bg-white-two"
          )}
        >
          Searched
        </Button>
        <Button
          onClick={() => setSelected("valued")}
          className={cn(
            "rounded-l-none w-36",
            selected === "valued" &&
              "bg-white-one !text-black-one hover:bg-white-two"
          )}
        >
          Most Valued
        </Button>
      </section>
      {selected === "searched" && (
        <Recommended
          title={"Searched Filers"}
          description={
            <span className={styles["description-text"]}>
              The following contains links and information for the most popular
              13F filers, sorted by market value.
            </span>
          }
          source={
            "https://gist.github.com/leftmove/daca5d470c869e9d6f14c298af809f9f"
          }
          className="w-full"
          filers={props.searched}
        />
      )}
      {selected === "valued" && (
        <Recommended
          title={"Most Valued Filers"}
          description={
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
          }
          source={
            "https://gist.github.com/leftmove/1e96a95bad8e590a440e37f07d305d2a"
          }
          className="w-full"
          filers={props.top}
        />
      )}
    </main>
  );
};

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps() {
  const search = await axios
    .get(server + "/filers/searched")
    .then((r) => r.data)
    .catch((e) => console.error(e));
  const searched = search?.filers || [];
  const most = await axios
    .get(server + "/filers/top")
    .then((r) => r.data)
    .catch((e) => console.error(e));
  const top = most?.filers || [];
  return {
    props: {
      searched,
      top,
    },
  };
}

export default Examples;
