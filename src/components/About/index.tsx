import { useContext } from 'react';

import { AppContext } from '@/pages/index';

import AppWindow from '@/components/AppWindow';
import HomeView from '@/components/views/Home';

export default function About() {
  const { isAboutOpen, setIsAboutOpen } = useContext(AppContext)!;
  return (
    <AppWindow appId="about" title="~/about.md" isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)}>
      <HomeView />
    </AppWindow>
  );
}
