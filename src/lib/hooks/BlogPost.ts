import { useState, useEffect } from 'react';

import type * as Types from '@/lib/types';

function calculateReadTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, '')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = chineseChars / 200 + englishWords / 250;
  return Math.max(1, Math.round(minutes));
}

export default function useBlogPost(slug: string | null) {
  const [post, setPost] = useState<Types.BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPost() {
      try {
        setLoading(true);

        const res = await fetch(`/posts/${slug}.md`);

        if (!res.ok) return;

        const raw = await res.text();

        const matter = await import('gray-matter');
        const { data, content } = matter.default(raw);

        const mapped: Types.BlogPost = {
          slug: slug as string,
          title: data.title ?? slug,
          date: data.date ?? '',
          tags: data.tags ?? [],
          excerpt: data.excerpt ?? '',
          color: data.color,
          content,
          readTime: calculateReadTime(content),
        };

        if (!cancelled) setPost(mapped);
      } catch {
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPost();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading };
}
