import { useEffect, useState, useRef, createContext } from 'react';
import { Provider } from 'react-redux';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import type * as Types from '@/lib/types';

import { MUSIC_LIST, PATH_LIST, TEXT_CONTENT } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { DEFAULT_SETTINGS, ThemeSettings, applySettingsToDOM, loadSettings, saveSettings } from '@/lib/settings';

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
import Settings from '@/components/Settings';

import styles from './index.module.css';

export type AppContextType = {
  availableArgs: Record<string, string[]>;
  availableCommands: Types.Command[];
  availablePaths: string[];
  setAvailableArgs: (args: Record<string, string[]>) => void;
  setAvailableCommands: (cmds: Types.Command[]) => void;
  setAvailablePaths: (paths: string[]) => void;
  backgroundImageUrl: string;
  backgroundColor: string;
  dynamicTitle: string | null;
  username: string;
  setBackgroundImageUrl: (url: string) => void;
  setBackgroundColor: (color: string) => void;
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  currentHash: string;
  settings: ThemeSettings;
  setSettings: (s: ThemeSettings) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

function PageComponent() {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [availableCommands, setAvailableCommands] = useState<Types.Command[]>([]);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [username, setUsername] = useState<string>(t('global.defaultUsername'));
  const [currentHash, setCurrentHash] = useState<string>('/');
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [availableArgs, setAvailableArgs] = useState<Record<string, string[]>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [settings, setSettingsState] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setSettings = (s: ThemeSettings) => {
    setSettingsState(s);
    saveSettings(s);
    applySettingsToDOM(s);
  };

  const handleMusicEnd = () => {
    setMusicIndex((prev) => (prev + 1) % MUSIC_LIST.length);
  };

  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentHash(hash);
      setDynamicTitle(null);
      setAvailableArgs({});
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

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
    const hashPaths = currentHash.split('/').filter(Boolean);
    setAvailablePaths(PATH_LIST[`/${hashPaths.join('/')}`] ?? []);
  }, [currentHash]);

  useEffect(() => {
    const backgroundImageUrl = localStorage.getItem('backgroundImageUrl') ?? '';
    setBackgroundImageUrl(backgroundImageUrl);
  }, []);

  useEffect(() => {
    const backgroundColor = localStorage.getItem('backgroundColor') ?? '';
    setBackgroundColor(backgroundColor);
  }, []);

  useEffect(() => {
    const loaded = loadSettings();
    setSettingsState(loaded);
    applySettingsToDOM(loaded);
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
        <title>{t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)}</title>
        <meta name="description" content={TEXT_CONTENT[currentHash]?.subtitle ?? TEXT_CONTENT['*'].subtitle} />
        <meta property="og:title" content={t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)} />
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
          dynamicTitle,
          setDynamicTitle,
          availableArgs,
          setAvailableArgs,
          settings,
          setSettings,
          isSettingsOpen,
          setIsSettingsOpen,
        }}
      >
        <div className={styles['app']} style={{ backgroundColor: backgroundColor }}>
          <img src={backgroundImageUrl ? backgroundImageUrl : settings.backgroundImageUrl || '/assets/bg.jpg'} className={styles['background']} alt="background" />
          <div className={styles['view-container']}>
            <Navigation currentHash={currentHash} />
            {renderView()}
          </div>
          <ConsoleManager />
          <Settings />
        </div>
      </AppContext.Provider>
    </Provider>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), { ssr: false });

export default Page;
