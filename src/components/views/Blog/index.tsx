import React from 'react';

import { t } from '@/lib/i18n';

import useCommandHandler from '@/lib/hooks/CommandHandler';
import { useBlogPosts, getTagColor } from '@/lib/hooks/BlogPosts';

import { AddConsoleLog } from '@/redux';

import styles from './Blog.module.css';

export default function BlogView() {
  const { posts, loading } = useBlogPosts();

  useCommandHandler({
    read: (_cmd, args) => {
      const slug = args[0] ?? '';
      if (!slug) {
        AddConsoleLog(t('/blog.commands.read.usage'));
        return;
      }
      const post = posts.find((p) => p.slug === slug);
      if (post) {
        window.location.hash = `#/blog/${slug}`;
        AddConsoleLog(t('/blog.commands.read.opening', post.title));
      } else {
        AddConsoleLog(t('/blog.commands.read.notFound', slug));
      }
    },
  });

  return (
    <div className={styles['blog-page']}>
      <p className="page-subtitle">{t('/blog.subtitle')}</p>
      <hr className="divider" />

      {loading && <p style={{ color: '#888' }}>{t('/blog.loading')}</p>}

      {!loading && posts.length === 0 && <div className={styles['empty']}>{t('/blog.empty')}</div>}

      {posts.length > 0 && (
        <div className={styles['timeline']}>
          <div className={styles['timeline-line']} />
          {posts.map((post, index) => {
            const tagColor = getTagColor(post.tags[0] ?? '');
            return (
              <div key={post.slug} className={styles['timeline-entry']}>
                <div
                  className={styles['timeline-dot']}
                  style={{
                    backgroundColor: tagColor,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
                <span className={styles['timeline-date']}>{post.date}</span>
                <div className={styles['post-card']} onClick={() => (window.location.hash = `#/blog/${post.slug}`)}>
                  <span className={styles['post-title']}>{post.title}</span>
                  <p className={styles['post-excerpt']}>{post.excerpt}</p>
                  <div className={styles['post-meta']}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles['tag-badge']} style={{ color: getTagColor(tag) }}>
                        {tag}
                      </span>
                    ))}
                    <span className={styles['read-time']}>{post.readTime} min read</span>
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
