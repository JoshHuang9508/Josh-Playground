import { useContext, useEffect } from 'react';

import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';
import useBlogPosts from '@/lib/hooks/BlogPosts';

import { AddConsoleLog } from '@/redux';

import { AppContext } from '@/pages/index';

import PostCard from './PostCard';

import styles from './Blog.module.css';

export default function BlogView() {
  const appContext = useContext(AppContext);
  const { posts, loading } = useBlogPosts();

  useEffect(() => {
    if (posts.length > 0) {
      appContext?.setAvailableArgs({ read: posts.map((p) => p.slug) });
    }
    return () => appContext?.setAvailableArgs({});
  }, [posts]);

  useTerminalCommand({
    read: {
      name: 'read',
      description: 'Read a blog post',
      usage: '@#00ffaaread@# @#fff700<slug>@#',
      handler: (_cmd, args) => {
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
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
