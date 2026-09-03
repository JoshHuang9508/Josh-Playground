import type { NextApiRequest, NextApiResponse } from 'next';

const CHANNEL_ID = 'UCSCPzKDoKrYmgBZeQZLU5cg';
const CHANNEL_AVATAR = 'https://yt3.googleusercontent.com/hUQNTQ0gn7zwO9sKA6C_CzJu0j5BXi7QjFNgZEx7DN7F53Z-JHsfzzvIMCkgQtG4N_CXL91v=s900-c-k-c0x00ffffff-no-rj';

function value(xml: string, tag: string): string {
  return (
    xml
      .match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
      ?.replace(/<!\[CDATA\[|\]\]>/g, '')
      .trim() ?? ''
  );
}

function attribute(xml: string, tag: string, name: string): string {
  return xml.match(new RegExp(`<${tag}[^>]*${name}="([^"]+)"`))?.[1] ?? '';
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default async function handler(_request: NextApiRequest, response: NextApiResponse) {
  try {
    const feedResponse = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
    if (!feedResponse.ok) throw new Error('Unable to load YouTube feed');

    const feed = await feedResponse.text();
    const entry = feed.match(/<entry>[\s\S]*?<\/entry>/)?.[0] ?? '';
    const videoId = value(entry, 'yt:videoId');
    const views = attribute(entry, 'media:statistics', 'views');

    response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    response.status(200).json({
      channelName: decodeXml(value(feed, 'title')),
      channelAvatar: CHANNEL_AVATAR,
      latestVideo: entry
        ? {
            title: decodeXml(value(entry, 'title')),
            url: attribute(entry, 'link', 'href') || `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail: attribute(entry, 'media:thumbnail', 'url'),
            publishedAt: value(entry, 'published'),
            views: views ? Number(views) : null,
          }
        : null,
    });
  } catch {
    response.status(502).json({ error: 'Unable to load YouTube data' });
  }
}
