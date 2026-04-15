import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { useBlogPost, getTagColor } from "@/lib/hooks/BlogPosts";

import styles from "./BlogPost.module.css";

interface BlogPostViewProps {
  slug: string;
}

export default function BlogPostView({ slug }: BlogPostViewProps) {
  const { post, loading } = useBlogPost(slug);
  const pageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [post]);

  if (loading) {
    return (
      <div className={styles["blogpost-page"]}>
        <div className={styles["loading"]}>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles["blogpost-page"]}>
        <div className={styles["loading"]}>Post not found.</div>
        <a className={styles["back-link"]} href="#/blog">
          &larr; Back to ~/blog
        </a>
      </div>
    );
  }

  return (
    <div className={styles["blogpost-page"]} ref={pageRef}>
      <div
        className={styles["progress-bar"]}
        style={{ width: `${progress}%` }}
      />

      <div className={styles["article-header"]}>
        <h1 className={styles["article-title"]}>{post.title}</h1>
        <div className={styles["article-meta"]}>
          <span className={styles["article-date"]}>{post.date}</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={styles["article-tag"]}
              style={{ color: getTagColor(tag) }}
            >
              {tag}
            </span>
          ))}
          <span className={styles["article-read-time"]}>
            {post.readTime} min read
          </span>
        </div>
      </div>

      <div className={styles["article-body"]}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className={styles["article-nav"]}>
        <a className={styles["back-link"]} href="#/blog">
          &larr; Back to ~/blog
        </a>
      </div>
    </div>
  );
}
