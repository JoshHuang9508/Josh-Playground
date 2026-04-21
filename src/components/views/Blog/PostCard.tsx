import type * as Types from '@/lib/types';

import { TAG_COLORS } from '@/lib/constants';

import useI18n from '@/lib/hooks/i18n';

import styles from './Blog.module.css';

interface PostCardProps {
  post: Types.BlogPostMeta;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  const { t } = useI18n();

  const tagColor = TAG_COLORS[post.tags[0] ?? ''];

  return (
    <div key={post.slug} className={styles['timeline-entry']}>
      <div className={styles['timeline-dot']} style={{ backgroundColor: tagColor, animationDelay: `${index * 0.1}s` }} />
      <span className={styles['timeline-date']}>{post.date}</span>
      <div className={styles['post-card']} onClick={() => (window.location.hash = `#/blog/${post.slug}`)}>
        <span className={styles['post-title']}>{post.title}</span>
        <p className={styles['post-excerpt']}>{post.excerpt}</p>
        <div className={styles['post-meta']}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles['tag-badge']} style={{ color: TAG_COLORS[tag] }}>
              {tag}
            </span>
          ))}
          <span className={styles['read-time']}>{t('blog.readTime', post.readTime.toString())}</span>
          <span className={styles['slug-text']}>{post.slug}</span>
        </div>
      </div>
    </div>
  );
}
