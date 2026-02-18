import { useState } from "react";
import { Provider } from "react-redux";
import dotenv from "dotenv";
import Head from "next/head";
import dynamic from "next/dynamic";

dotenv.config({ path: ".env" });

import "@/styles/global.css";
import styles from "@/styles/_app.module.css";

import store from "@/redux";

import ConsoleManager from "@/components/ConsoleManager";

import { Command } from "@/lib/types";

import { AppContext } from "@/hooks/useCommandHandler";

import textContent from "@/lib/text-content.json";

function PageComponent({ Component, pageProps }) {
  // States
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [username, setUsername] = useState<string>("Anonymous");

  // Variables
  const path = window ? window.location.pathname : "/";

  return (
    <Provider store={store}>
      <Head>
        <title>{`Whydog - ${textContent[path]?.title ?? textContent["*"].title}`}</title>
        <meta
          name="description"
          content={textContent[path]?.subtitle ?? textContent["*"].subtitle}
        />
        <meta
          property="og:title"
          content={`Whydog - ${textContent[path]?.title ?? textContent["*"].title}`}
        />
        <meta
          property="og:description"
          content={textContent[path]?.subtitle ?? textContent["*"].subtitle}
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

          <div className={styles["container"]}>
            <Component {...pageProps} />
          </div>

          <ConsoleManager />
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
