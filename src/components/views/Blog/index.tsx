import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import { useBlogPosts, getTagColor } from "@/lib/hooks/BlogPosts";

import styles from "./Blog.module.css";

export default function BlogView() {
  const { posts, loading } = useBlogPosts();

  useCommandHandler({
    read: (_cmd, args) => {
      const slug = args[0] ?? "";
      if (!slug) {
        AddConsoleLog("Usage: @#00ffaaread@# @#fff700<slug>@#");
        return;
      }
      const post = posts.find((p) => p.slug === slug);
      if (post) {
        window.location.hash = `#/blog/${slug}`;
        AddConsoleLog(`Opening @#fff700${post.title}@#...`);
      } else {
        AddConsoleLog(`Post @#fff700${slug}@# not found.`);
      }
    },
  });

  return (
    <div className={styles["blog-page"]}>
      <div className={styles["header"]}>
        <p className="page-header" style={{ color: "#ffa24c" }}>
          ~/blog
        </p>
        <p className="page-subtitle">
          Thoughts on development, life, and gaming
        </p>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <div className={styles["empty"]}>No posts yet. Stay tuned.</div>
      )}

      {posts.length > 0 && (
        <div className={styles["timeline"]}>
          <div className={styles["timeline-line"]} />
          {posts.map((post, index) => {
            const tagColor = getTagColor(post.tags[0] ?? "");
            return (
              <div
                key={post.slug}
                className={styles["timeline-entry"]}
              >
                <div
                  className={styles["timeline-dot"]}
                  style={{
                    backgroundColor: tagColor,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
                <span className={styles["timeline-date"]}>{post.date}</span>
                <div
                  className={styles["post-card"]}
                  onClick={() =>
                    (window.location.hash = `#/blog/${post.slug}`)
                  }
                >
                  <span className={styles["post-title"]}>{post.title}</span>
                  <p className={styles["post-excerpt"]}>{post.excerpt}</p>
                  <div className={styles["post-meta"]}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={styles["tag-badge"]}
                        style={{ color: getTagColor(tag) }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={styles["read-time"]}>
                      {post.readTime} min read
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
