import { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { MUSIC_LIST, TEXT_CONTENT } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { AppContext } from '@/lib/hooks/CommandHandler';

import store, { SetUsername } from '@/redux';

import ConsoleManager from '@/components/ConsoleManager';
import HomeView from '@/components/views/Home';
import ListenTogetherView from '@/components/views/ListenTogether';
import NotFoundView from '@/components/views/NotFound';
import ProjectsView from '@/components/views/Projects';
import BlogView from '@/components/views/Blog';
import BlogPostView from '@/components/views/BlogPost';
import OsuStatsView from '@/components/views/OsuStats';
import Navigation from '@/components/Navigation';

import '@/global.css';
import styles from './_app.module.css';

function PageComponent() {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [availableCommands, setAvailableCommands] = useState<Types.Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [username, setUsername] = useState<string>(t('global.defaultUsername'));
  const [currentHash, setCurrentHash] = useState<string>('/');
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);

  const handleMusicEnd = () => {
    setMusicIndex((prev) => (prev + 1) % MUSIC_LIST.length);
  };

  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentHash(hash);
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  // useEffect(() => {
  //   const isMobile = ["Mobile", "iPhone", "iPad", "Android"].some((userAgent) =>
  //     navigator.userAgent.includes(userAgent),
  //   );
  //   setIsMobile(isMobile);
  // }, []);

  useEffect(() => {
    const onInteraction = () => {
      if (!audioPlayerRef.current || isPlaying) return;
      audioPlayerRef.current.play();
      audioPlayerRef.current.volume = 0.05;
      setIsPlaying(true);
    };
    document.addEventListener('click', onInteraction);
    document.addEventListener('touchstart', onInteraction);
    return () => {
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('touchstart', onInteraction);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.src = MUSIC_LIST[musicIndex].path;
    audioPlayerRef.current.play();
    audioPlayerRef.current.volume = 0.05;
  }, [musicIndex]);

  useEffect(() => {
    const backgroundImageUrl = localStorage.getItem('backgroundImageUrl') ?? '';
    setBackgroundImageUrl(backgroundImageUrl);
  }, []);

  useEffect(() => {
    const backgroundColor = localStorage.getItem('backgroundColor') ?? '';
    setBackgroundColor(backgroundColor);
  }, []);

  useEffect(() => {
    const username = localStorage.getItem('username') ?? t('global.defaultUsername');
    setUsername(username);
    SetUsername(username);
  }, []);

  const renderView = () => {
    if (currentHash.startsWith('/blog/') && currentHash !== '/blog') {
      const slug = currentHash.slice('/blog/'.length);
      return <BlogPostView slug={slug} />;
    }
    switch (currentHash) {
      case '/':
        return <HomeView />;
      case '/projects':
        return <ProjectsView />;
      case '/blog':
        return <BlogView />;
      case '/listentogether':
        return <ListenTogetherView />;
      case '/osu':
        return <OsuStatsView />;
      default:
        return <NotFoundView />;
    }
  };

  return (
    <Provider store={store}>
      <audio data-audio-player ref={audioPlayerRef} src={MUSIC_LIST[musicIndex].path} onEnded={handleMusicEnd} />
      <Head>
        <title>{t('global.siteTitle', TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)}</title>
        <meta name="description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
        <meta property="og:title" content={t('global.siteTitle', TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)} />
        <meta property="og:description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
        <meta property="og:url" content="https://www.whydog.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/preview.png" />
        <link rel="icon" type="image/png" href="/assets/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
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
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            backgroundColor: backgroundColor ? backgroundColor : undefined,
            transition: 'background-color 0.3s ease-in-out',
          }}
        >
          <img src={backgroundImageUrl ? backgroundImageUrl : '/assets/bg.jpg'} className={styles['background']} alt="background" />
          <div className={styles['container']}>
            <Navigation currentHash={currentHash} />
            {renderView()}
          </div>
          <ConsoleManager />
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
