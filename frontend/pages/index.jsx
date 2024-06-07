"use server";

import styles from "@/styles/Home.module.css";

import axios from "axios";

import Head from "next/head";
import Image from "next/image";

import { font, fontLight, fontBold } from "@fonts";

import Layout from "components/Layouts/Home";
import Search from "components/Search/Homepage/Search";
import Suggested from "components/Suggested/Suggested";
import Health from "components/Health/Health";
import Hero from "@/images/hero.jpg";
import FolderIcon from "@/images/folder.svg";
import FileIcon from "@/images/file.svg";
import BookIcon from "@/images/book.svg";

export default function Home(props) {
  return (
    <>
      <Head>
        <title>
          wallstreetlocal | Advice from the world&apos;s biggest investors
        </title>
        <meta
          name="description"
          content="Thousands of filings from the world's biggest investors. Wall Street's stock portfolio, for free."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Health health={props.health} />
      <div className={styles["landing"]}>
        <div className={styles["landing-hero"]}>
          <Image
            className={styles["hero-image"]}
            src={Hero}
            alt="landing skyscraper"
            fill={true}
          />
        </div>
        <div className={styles["search-header"]}>
          <Search />
          <div className={styles["header"]}>
            <span className={[styles["search-hint"], font.className].join(" ")}>
              Nothing to search? See filers sorted by popularity and value in
              the top right corner.
            </span>
            <span
              className={[styles["main-header"], fontBold.className].join(" ")}
            >
              Thousands of filings from the world&apos;s biggest investors.
            </span>
            <span className={[styles["sub-header"], font.className].join(" ")}>
              Wall Street&apos;s stock portfolio, for free.
            </span>
          </div>
        </div>
        <Suggested className={styles["Suggested-header"]} variant="homepage" />
      </div>
      <main className={styles["explore"]}>
        <span
          className={[styles["explore-header"], fontBold.className].join(" ")}
        >
          Explore historical stock data, directly from the SEC.
        </span>
        <p
          className={[styles["explore-explanation"], fontLight.className].join(
            " "
          )}
        >
          The Securities and Exchange Commission (SEC) keeps record of every
          company in the United States. Companies whose holdings surpass $100
          million though, are required to file a special type of form: the 13F
          form. This form, filed quarterly, discloses the filer&apos;s holdings,
          providing transparency into their investment activities and allowing
          the public and other market participants to monitor them.
        </p>
        <p
          className={[styles["explore-explanation"], fontLight.className].join(
            " "
          )}
        >
          The problem though, is that these holdings are often cumbersome to
          access, and valuable analysis is often hidden behind a paywall.
          Through wallstreetlocal, the SEC&apos;s 13F filers become more
          accessible and open.
        </p>
        {/* <div className={styles["selling-points"]}>
          <div className={styles["selling-point"]}>
            <FolderIcon className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], font.className].join(" ")}
              >
                Stock Data
              </span>
              <span
                className={[
                  styles["selling-description"],
                  fontLight.className,
                ].join(" ")}
              >
                Stocks from over 20 years, matched with external data to create
                accurate, consistent, and useful analysis.
              </span>
            </div>
          </div>
          <div className={styles["selling-point"]}>
            <FileIcon className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], font.className].join(" ")}
              >
                SEC Filings
              </span>
              <span
                className={[
                  styles["selling-description"],
                  fontLight.className,
                ].join(" ")}
              >
                Filings directly from the SEC, served in an accessible format.
                Over 20 years of coverage.
              </span>
            </div>
          </div>
          <div className={styles["selling-point"]}>
            <BookIcon className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], font.className].join(" ")}
              >
                Free Forever
              </span>
              <span
                className={[
                  styles["selling-description"],
                  fontLight.className,
                ].join(" ")}
              >
                The entire backlog of the SEC, free and without quotas.
              </span>
            </div>
          </div>
        </div> */}
      </main>
    </>
  );
}

const server = process.env.NEXT_PUBLIC_SERVER;
export async function getServerSideProps() {
  const health = await axios
    .get(server + "/health")
    .then((r) => r.status === 200)
    .then(() => true)
    .catch(() => false);
  return {
    props: {
      health,
    },
  };
}

Home.getLayout = ({ Component, pageProps }) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);
