import { t } from '@/lib/i18n';

import useBlogPosts from '@/lib/hooks/BlogPosts';
import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import PostCard from './PostCard';

import styles from './Blog.module.css';

export default function BlogView() {
  const { posts, loading } = useBlogPosts();

  useTerminalCommand({});

  return (
    <div className={styles['blog-page']}>
      <p className="page-subtitle">{t('blog.subtitle')}</p>
      <hr className="divider" />

      {loading && <p className={styles['loading-text']}>{t('blog.loading')}</p>}

      {!loading && posts.length === 0 && <div className={styles['empty']}>{t('blog.empty')}</div>}

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
