import type { AppProps } from 'next/app';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import '@/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
