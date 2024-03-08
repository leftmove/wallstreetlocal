import styles from "@/styles/Home.module.css";

import Head from "next/head";

import Image from "next/image";
import Link from "next/link";

import { font, fontLight, fontBold } from "@fonts";

import Layout from "@/components/Layouts/Home";

import Search from "@/components/Search/Homepage/Search";
// import Recommended from "@/components/Recommended/Recommended";

// import File from "@/public/static/file.svg";
// import Folder from "@/public/static/folder.svg";
// import Book from "@/public/static/book.svg";
import Hero from "@/public/static/hero.jpg";

export default function Home() {
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
      <div className={styles["landing"]}>
        <div className={styles["landing-hero"]}>
          <Image
            className={styles["hero-image"]}
            src={Hero}
            alt="landing skyscraper"
            sizes="100%"
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
            <Link
              href="https://ko-fi.com/wallstreetlocal"
              className={[styles["donate-hint"], font.className].join(" ")}
              target="_blank"
            >
              <span>
                If you are enjoying this website, please consider donating.
              </span>
            </Link>
          </div>
        </div>
        {/* <Recommended variant="homepage" /> */}
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
          13F filers are institutional investment managers required to submit a
          13F Form with the U.S. Securities and Exchange Commission (SEC). To
          qualify as a 13F filer, an institutional investment manager must have
          a market value of at least $100 million. The form, filed quarterly,
          discloses the manager's holdings, providing transparency into their
          investment activities and allowing the public and other market
          participants to monitor large institutional investors.
        </p>
        {/* <div className={styles["selling-points"]}>
          <div className={styles["selling-point"]}>
            <Folder className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], font.className].join(
                  " "
                )}
              >
                Historical Data
              </span>
              <span
                className={[
                  styles["selling-description"],
                  fontLight.className,
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
                className={[styles["selling-header"], font.className].join(
                  " "
                )}
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
            <Book className={styles["selling-svg"]} />
            <div className={styles["selling-text"]}>
              <span
                className={[styles["selling-header"], font.className].join(
                  " "
                )}
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
      {/* <div className={styles["bottom"]}></div> */}
    </>
  );
}

Home.getLayout = ({ Component, pageProps }) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);
