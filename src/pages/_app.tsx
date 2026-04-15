import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import Head from "next/head";
import dynamic from "next/dynamic";

import store from "@/redux";

import { Command } from "@/lib/types";

import { TEXT_CONTENT } from "@/lib/constants";

import { t } from "@/lib/i18n";

import { AppContext } from "@/lib/hooks/CommandHandler";

import ConsoleManager from "@/components/ConsoleManager";
import HomeView from "@/components/views/Home";
import MobileView from "@/components/views/Mobile";
import ListenTogetherView from "@/components/views/ListenTogether";
import YtDownloaderView from "@/components/views/YtDownloader";
import NotFoundView from "@/components/views/NotFound";

import "@/global.css";
import styles from "./_app.module.css";

function PageComponent() {
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [username, setUsername] = useState<string>(t("global.defaultUsername"));
  const [currentHash, setCurrentHash] = useState<string>("/");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash.slice(1) || "/";
      setCurrentHash(hash);
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    const isMobile = ["Mobile", "iPhone", "iPad", "Android"].some((userAgent) =>
      navigator.userAgent.includes(userAgent),
    );
    setIsMobile(isMobile);
  }, []);

  const renderView = () => {
    if (isMobile) {
      return <MobileView />;
    } else {
      switch (currentHash) {
        case "/":
          return <HomeView />;
        case "/listentogether":
          return <ListenTogetherView />;
        case "/ytdownloader":
          return <YtDownloaderView />;
        default:
          return <NotFoundView />;
      }
    }
  };

  return (
    <Provider store={store}>
      <Head>
        <title>
          {t(
            "global.siteTitle",
            TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT["*"].title,
          )}
        </title>
        <meta
          name="description"
          content={
            TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT["*"].subtitle
          }
        />
        <meta
          property="og:title"
          content={t(
            "global.siteTitle",
            TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT["*"].title,
          )}
        />
        <meta
          property="og:description"
          content={
            TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT["*"].subtitle
          }
        />
        <meta property="og:url" content="https://www.whydog.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/preview.png" />
        <link
          rel="icon"
          type="image/png"
          href="/assets/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/apple-touch-icon.png"
        />
        <link rel="manifest" href="/assets/site.webmanifest" />
      </Head>
      <AppContext.Provider
        value={{
          availableCommands,
          availablePaths,
          setAvailableCommands,
          setAvailablePaths,
          backgroundImageUrl,
          backgroundColor,
          setBackgroundImageUrl,
          setBackgroundColor,
          username,
          setUsername,
          currentHash,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100vw",
            backgroundColor: backgroundColor ? backgroundColor : undefined,
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          <img
            src={backgroundImageUrl ? backgroundImageUrl : "/assets/bg.jpg"}
            className={styles["background"]}
            alt="background"
          />
          <div className={styles["container"]}>{renderView()}</div>
          {!isMobile && <ConsoleManager />}
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
