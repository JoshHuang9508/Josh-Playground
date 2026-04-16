import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import { TAG_COLORS } from '@/lib/constants';

import { t } from '@/lib/i18n';

import useCommandHandler, { AppContext } from '@/lib/hooks/CommandHandler';
import useBlogPost from '@/lib/hooks/BlogPost';

import styles from './BlogPost.module.css';

interface BlogPostViewProps {
  slug: string;
}

export default function BlogPostView({ slug }: BlogPostViewProps) {
  const { post, loading } = useBlogPost(slug);

  const pageRef = useRef<HTMLDivElement>(null);

  const [progressBarHeight, setProgressBarHeight] = useState(0);

  const appContext = useContext(AppContext);

  useCommandHandler({});

  useEffect(() => {
    if (post) appContext?.setDynamicTitle(post.title);
    else if (!loading) appContext?.setDynamicTitle(null);
    return () => {
      appContext?.setDynamicTitle(null);
    };
  }, [post, loading, appContext]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setProgressBarHeight(el.scrollTop + el.clientHeight * (progress / 100));
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [post]);

  if (loading) {
    return (
      <div className={styles['blogpost-page']}>
        <div className={styles['loading']}>{t('blogPost.loading')}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles['blogpost-page']}>
        <div className={styles['loading']}>{t('blogPost.notFound')}</div>
        <a className={styles['back-link']} href="#/blog">
          {t('blogPost.backLink')}
        </a>
      </div>
    );
  }

  return (
    <div className={styles['blogpost-page']} ref={pageRef}>
      <div className={styles['progress-bar']} style={{ height: `${progressBarHeight}px`, backgroundColor: TAG_COLORS[post.tags[0] ?? ''] }} />

      <div className={styles['article-header']}>
        <h1 className={styles['article-title']}>{post.title}</h1>
        <div className={styles['article-meta']}>
          <span className={styles['article-date']}>{post.date}</span>
          {post.tags.map((tag) => (
            <span key={tag} className={styles['article-tag']} style={{ color: TAG_COLORS[tag] }}>
              {tag}
            </span>
          ))}
          <span className={styles['article-read-time']}>{post.readTime} min read</span>
        </div>
      </div>

      <div className={styles['article-body']}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className={styles['article-nav']}>
        <a className={styles['back-link']} href="#/blog">
          {t('blogPost.backLink')}
        </a>
      </div>
    </div>
  );
}
