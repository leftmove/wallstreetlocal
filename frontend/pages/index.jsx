import styles from "@/styles/Home.module.css";

import Head from "next/head";

import Image from "next/image";
import { Inter } from "@next/font/google";
const interBold = Inter({ subsets: ["latin"], weight: "900" });
const inter = Inter({ subsets: ["latin"], weight: "700" });
const interLight = Inter({ subsets: ["latin"], weight: "500" });

import Layout from "@/components/Layouts/Home";

import Search from "@/components/Search/Homepage/Search";
import Recommended from "@/components/Recommended/Homepage/Recommended";

import File from "@/public/static/file.svg";
import Folder from "@/public/static/folder.svg";
import Book from "@/public/static/book.svg";
import Hero from "@/public/static/hero.jpg";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          wallstreetlocal | advice from the world&apos;s biggest investors
        </title>
        <meta
          name="description"
          content="Thousands of filings from the world's biggest investors. Wall Street's stock portfolio, for free."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles["landing"]}>
        <div className={styles["landing-hero"]}>
          <Image
            className={styles["hero-image"]}
            src={Hero}
            alt="landing skyscraper"
            sizes="100vw"
          />
        </div>
        <div className={styles["search-header"]}>
          <Search />
          <div className={styles["header"]}>
            <span
              className={[styles["main-header"], interBold.className].join(" ")}
            >
              Thousands of filings from the world&apos;s biggest investors.
            </span>
            <span className={[styles["sub-header"], inter.className].join(" ")}>
              Wall Street&apos;s stock portfolio, for free.
            </span>
          </div>
        </div>
        <Recommended />
      </div>
      <main className={styles["explore"]}>
        <span
          className={[styles["explore-header"], interBold.className].join(" ")}
        >
          Explore historical stock data, directly from the SEC.
        </span>
        <div className={styles["selling-points"]}>
          <div className={styles["selling-point"]}>
            <Folder className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], inter.className].join(
                  " "
                )}
              >
                Historical Data
              </span>
              <span
                className={[
                  styles["selling-description"],
                  interLight.className,
                ].join(" ")}
              >
                Stock and filing data from over 20 years to compare. Avaiable in
                API form.
              </span>
            </div>
          </div>
          <div className={styles["selling-point"]}>
            <File className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], inter.className].join(
                  " "
                )}
              >
                SEC Filings
              </span>
              <span
                className={[
                  styles["selling-description"],
                  interLight.className,
                ].join(" ")}
              >
                Filings directly from the SEC, served in an accessible format.
                Over 20 years of coverage.
              </span>
            </div>
          </div>
          <div className={styles["selling-point"]}>
            <Book className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], inter.className].join(
                  " "
                )}
              >
                Free Forever
              </span>
              <span
                className={[
                  styles["selling-description"],
                  interLight.className,
                ].join(" ")}
              >
                The entire backlog of the SEC, free and without quotas.
              </span>
            </div>
          </div>
        </div>
      </main>
      <div className={styles["bottom"]}></div>
    </>
  );
}

Home.getLayout = ({ Component, pageProps }) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);
