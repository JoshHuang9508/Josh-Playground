import { useState, useEffect } from "react";

import { BlogPost, BlogPostMeta } from "@/lib/types";
import { TAG_COLORS } from "@/lib/constants";

function calculateReadTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = chineseChars / 200 + englishWords / 250;
  return Math.max(1, Math.round(minutes));
}

export function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? "#888";
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/posts/index.json");
        if (!res.ok) {
          setPosts([]);
          return;
        }
        const index: BlogPostMeta[] = await res.json();
        setPosts(index.sort((a, b) => b.date.localeCompare(a.date)));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return { posts, loading };
}

export function useBlogPost(slug: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function loadPost() {
      try {
        const res = await fetch(`/posts/${slug}.md`);
        if (!res.ok) {
          setPost(null);
          return;
        }
        const raw = await res.text();

        const matter = await import("gray-matter");
        const { data, content } = matter.default(raw);

        const blogPost: BlogPost = {
          slug: slug as string,
          title: data.title ?? slug,
          date: data.date ?? "",
          tags: data.tags ?? [],
          excerpt: data.excerpt ?? "",
          color: data.color,
          content,
          readTime: calculateReadTime(content),
        };
        setPost(blogPost);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  return { post, loading };
}
