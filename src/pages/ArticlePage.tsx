import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortableText } from '@portabletext/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getArticleBySlug, urlFor } from '../lib/sanity';

// ─── Types ────────────────────────────────────────────────────────────
type SanityArticle = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  readingTime?: number;
  publishedAt?: string;
  tags?: string[];
  featuredImage?: { asset: object; alt?: string };
  youtubeVideos?: string[];
  body?: object[];
  ctaText?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
};


// ─── Portable text components ─────────────────────────────────────────
const portableComponents = {
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '32px 0 12px', lineHeight: 1.3 }}>{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '36px 0 12px', lineHeight: 1.3 }}>{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '28px 0 8px', lineHeight: 1.3 }}>{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.8, margin: '0 0 18px' }}>{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote style={{ borderLeft: '4px solid #e8622a', paddingLeft: '16px', margin: '24px 0', fontStyle: 'italic', color: '#6B7280', fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7 }}>{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ fontWeight: 700, color: '#0f2318' }}>{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: '#e8622a', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{children}</a>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul style={{ paddingLeft: '20px', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol style={{ paddingLeft: '20px', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{children}</li>
    ),
  },
};

// ─── Share section ────────────────────────────────────────────────────
function ShareSection({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waText = encodeURIComponent(`${title} — ${window.location.href}`);

  return (
    <div
      style={{
        marginTop: '40px',
        padding: '24px',
        borderRadius: '14px',
        background: '#F8F7F4',
        border: '1px solid #E8E4DE',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#0f2318',
          fontFamily: 'var(--font-body)',
          margin: '0 0 14px',
        }}
      >
        Found this useful?
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 18px',
            borderRadius: '10px',
            background: '#25D366',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            textDecoration: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </a>
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 18px',
            borderRadius: '10px',
            background: copied ? '#E8F5E9' : '#fff',
            border: '1px solid #E8E4DE',
            color: copied ? '#15803D' : '#374151',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : '🔗 Copy link'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<SanityArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getArticleBySlug(slug)
      .then(data => {
        if (data) setArticle(data);
      })
      .catch(() => {/* not found */})
      .finally(() => setLoading(false));
  }, [slug]);

  const isNotFound = !loading && !article;

  const publishedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const metaTitle       = article?.seoTitle || article?.title || 'CorpusCalc';
  const metaDescription = article?.seoDescription || article?.excerpt || '';
  const metaOgTitle     = article?.ogTitle || metaTitle;
  const metaOgDescription = article?.ogDescription || metaDescription;
  const canonicalUrl    = typeof window !== 'undefined' ? `${window.location.origin}/knowledge/${slug}` : '';

  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>{metaTitle} | CorpusCalc</title>
        <meta name="description" content={metaDescription} />
        {article?.focusKeyword && <meta name="keywords" content={article.focusKeyword} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaOgTitle} />
        <meta property="og:description" content={metaOgDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {article?.featuredImage?.asset && (
          <meta property="og:image" content={urlFor(article.featuredImage.asset as object).width(1200).url()} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaOgTitle} />
        <meta name="twitter:description" content={metaOgDescription} />
      </Helmet>
      <Navbar />

      {/* Loading skeleton */}
      {loading && (
        <div className="container py-16">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ height: '12px', width: '180px', background: '#F0EDE8', borderRadius: '6px', marginBottom: '24px' }} />
            <div style={{ height: '42px', width: '90%', background: '#F0EDE8', borderRadius: '8px', marginBottom: '12px' }} />
            <div style={{ height: '42px', width: '60%', background: '#F0EDE8', borderRadius: '8px', marginBottom: '24px' }} />
            <div style={{ height: '2px', background: '#F0EDE8', borderRadius: '2px', marginBottom: '32px' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '16px', background: '#F0EDE8', borderRadius: '6px', marginBottom: '10px', width: i % 2 === 0 ? '80%' : '100%' }} />
            ))}
          </div>
        </div>
      )}

      {/* 404 */}
      {isNotFound && (
        <div className="container py-16" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📖</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>Article not found</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
            This article may have been moved or doesn't exist yet.
          </p>
          <Link to="/knowledge" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
            Back to Articles
          </Link>
        </div>
      )}

      {/* Article content */}
      {!loading && article && (
        <div className="container py-12">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
              <Link to="/knowledge" style={{ color: '#9CA3AF', textDecoration: 'none' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#e8622a'; }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}>
                Knowledge
              </Link>
              <span>›</span>
              <span style={{ color: '#374151' }}>{article.title}</span>
            </nav>

            {/* Tag pill + reading time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {article.tags && article.tags.map(t => (
                <span
                  key={t}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 11px',
                    borderRadius: '20px',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t}
                </span>
              ))}
              {article.readingTime && (
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
                  {article.readingTime} min read
                </span>
              )}
              {publishedDate && (
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
                  · {publishedDate}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(26px, 5vw, 36px)',
                fontWeight: 800,
                color: '#0f2318',
                fontFamily: 'var(--font-display)',
                margin: '0 0 20px',
                lineHeight: 1.2,
              }}
            >
              {article.title}
            </h1>

            {/* Coral divider */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #e8622a 0%, #f5a07a 60%, transparent 100%)', borderRadius: '2px', marginBottom: '28px' }} />

            {/* Excerpt */}
            {article.excerpt && (
              <p
                style={{
                  fontSize: '17px',
                  color: '#6B7280',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.75,
                  margin: '0 0 32px',
                  fontStyle: 'italic',
                }}
              >
                {article.excerpt}
              </p>
            )}

            {/* Featured image */}
            {article.featuredImage?.asset && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '32px' }}>
                <img
                  src={urlFor(article.featuredImage.asset).width(680).url()}
                  alt={(article.featuredImage as { alt?: string }).alt ?? article.title}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {/* Body — Sanity Portable Text */}
            {article.body && article.body.length > 0 && (
              <div>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <PortableText value={article.body as any} components={portableComponents} />
              </div>
            )}

            {/* Bottom CTA */}
            <div
              style={{
                marginTop: '48px',
                borderRadius: '16px',
                background: '#F8F7F4',
                border: '1px solid #E8E4DE',
                padding: '28px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 8px', lineHeight: 1.3 }}>
                {article.ctaText ?? 'Ready to plan your retirement?'}
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 18px', lineHeight: 1.6 }}>
                Use CorpusCalc to build a personalised plan — phases, drawdown, and kids goals included.
              </p>
              <Link
                to="/plan"
                style={{
                  display: 'inline-block',
                  padding: '11px 28px',
                  borderRadius: '12px',
                  background: '#0f2318',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                }}
              >
                Build My Plan →
              </Link>
            </div>

            {/* Share section */}
            <ShareSection title={article.title} />

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
