import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import dotenv from "dotenv";
import Head from "next/head";
import dynamic from "next/dynamic";

dotenv.config({ path: ".env" });

import "@/styles/global.css";
import styles from "@/styles/_app.module.css";

import store from "@/redux";

import ConsoleManager from "@/components/ConsoleManager";
import HomeView from "@/components/views/HomeView";
import ListenTogetherView from "@/components/views/ListenTogetherView";
import YtDownloaderView from "@/components/views/YtDownloaderView";
import NotFoundView from "@/components/views/NotFoundView";

import { Command } from "@/lib/types";

import { AppContext } from "@/hooks/useCommandHandler";

import textContent from "@/lib/text-content.json";

function PageComponent() {
  // States
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [username, setUsername] = useState<string>("Anonymous");
  const [currentHash, setCurrentHash] = useState<string>("/");

  // Hash routing
  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash.slice(1) || "/";
      setCurrentHash(hash);
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const renderView = () => {
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
  };

  return (
    <Provider store={store}>
      <Head>
        <title>{`Whydog - ${textContent[currentHash]?.title ?? textContent["*"].title}`}</title>
        <meta
          name="description"
          content={
            textContent[currentHash]?.subtitle ?? textContent["*"].subtitle
          }
        />
        <meta
          property="og:title"
          content={`Whydog - ${textContent[currentHash]?.title ?? textContent["*"].title}`}
        />
        <meta
          property="og:description"
          content={
            textContent[currentHash]?.subtitle ?? textContent["*"].subtitle
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
            src={backgroundImageUrl}
            className={styles["background"]}
            alt="background"
          />

          <div className={styles["container"]}>{renderView()}</div>

          <ConsoleManager />
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
