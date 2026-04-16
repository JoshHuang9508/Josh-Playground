import { useState, useEffect } from 'react';

import type * as Types from '@/lib/types';

export default function useBlogPosts() {
  const [posts, setPosts] = useState<Types.BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await fetch('/posts/index.json');
        if (!res.ok) {
          setPosts([]);
          return;
        }
        const data: Types.BlogPostMeta[] = await res.json();

        if (!cancelled) setPosts(data.sort((a, b) => b.date.localeCompare(a.date)));
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}
