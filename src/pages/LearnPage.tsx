import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const LEARN_STYLES = `
  .learn-hero-section { padding: 36px 20px 30px !important; }
  .learn-hero-h1 { font-size: 28px !important; }
  @media (min-width: 480px) {
    .learn-hero-section { padding: 64px 24px 52px !important; }
    .learn-hero-h1 { font-size: 42px !important; }
  }
`;
import { getAllArticles } from '../lib/sanity';

type DisplayArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  readingTime: number;
  publishedAt: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
};

const TAG_COLORS: Record<string, string> = {
  Inflation: '#DC2626',
  SIP: '#16A34A',
  Strategy: '#1D4ED8',
  Basics: '#D97706',
  Geopolitics: '#7C3AED',
};

const FILTER_TABS = ['All', 'Inflation', 'SIP', 'Strategy', 'Basics', 'Geopolitics'];

// Static fallback — used when Sanity returns empty or is unreachable
const FALLBACK_ARTICLES: DisplayArticle[] = [
  {
    id: 'global-wars-retirement-inflation',
    slug: 'global-wars-retirement-inflation',
    title: 'How Global Wars Are Making Your Retirement More Expensive',
    excerpt: "Russia-Ukraine, Middle East tensions, and supply chain disruptions are quietly eroding your retirement corpus. Here's how to protect it.",
    tags: ['Inflation', 'Strategy'],
    readingTime: 5,
    publishedAt: '2026-04-04',
    seoTitle: 'How Global Wars Are Making Retirement More Expensive | CorpusCalc',
    seoDescription: 'Geopolitical conflicts drive inflation and impact Indian retirement planning. Here\'s how to prepare.',
  },
  {
    id: 'dollar-rupee-retirement',
    slug: 'dollar-rupee-retirement',
    title: 'The Dollar-Rupee Story: Why Your Retirement Number Keeps Changing',
    excerpt: "Every time the rupee weakens, your imported lifestyle costs more. Here's what a weak rupee means for your retirement plan.",
    tags: ['Strategy', 'Basics'],
    readingTime: 4,
    publishedAt: '2026-04-04',
    seoTitle: 'Dollar-Rupee Story: Why Your Retirement Number Changes | CorpusCalc',
    seoDescription: 'Every time the rupee weakens, your retirement corpus needs grow. Here\'s what to do about it.',
  },
  {
    id: 'china-slowdown-mutual-funds',
    slug: 'china-slowdown-mutual-funds',
    title: "China's Economy Is Slowing Down. That's Bad News for Your Mutual Funds",
    excerpt: "Chinese economic weakness is rippling through global markets. Indian equity funds are not immune. Here's what long-term investors should know.",
    tags: ['Strategy', 'SIP'],
    readingTime: 5,
    publishedAt: '2026-04-04',
    seoTitle: "China's Slowdown: What It Means for Your Mutual Funds | CorpusCalc",
    seoDescription: "How China's economic slowdown affects Indian mutual funds and what retirement planners should do about it.",
  },
  {
    id: 'us-fed-rates-india-sip',
    slug: 'us-fed-rates-india-sip',
    title: 'US Fed Rate Hikes and Your Indian SIP: The Hidden Connection',
    excerpt: "When the US Fed raises interest rates, FIIs pull money out of India. Your SIP feels it. Here's the full picture and why you should keep investing anyway.",
    tags: ['SIP', 'Strategy'],
    readingTime: 5,
    publishedAt: '2026-04-04',
    seoTitle: 'US Fed Rate Hikes and Your Indian SIP: The Connection | CorpusCalc',
    seoDescription: 'How US Federal Reserve rate decisions quietly affect your Indian SIP returns and retirement corpus.',
  },
  {
    id: 'oil-price-retirement-india',
    slug: 'oil-price-retirement-india',
    title: 'Oil at $100 Again? How Middle East Tensions Are Reshaping Indian Retirement Planning',
    excerpt: "India imports 85% of its oil. Every Middle East flare-up hits your petrol bill, your groceries and quietly your retirement corpus. Here's the math.",
    tags: ['Inflation', 'Basics'],
    readingTime: 4,
    publishedAt: '2026-04-04',
    seoTitle: 'Oil at $100: How Middle East Tensions Affect Your SIP | CorpusCalc',
    seoDescription: 'Rising oil prices reshape Indian retirement planning. Here\'s what $100 oil means for your corpus.',
  },
];

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? '#6B7280';
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ArticleCard({ a }: { a: DisplayArticle }) {
  const primaryTag = a.tags[0] ?? '';
  const barColor = tagColor(primaryTag);

  return (
    <Link to={`/knowledge/${a.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          borderRadius: '14px',
          background: '#fff',
          border: '1px solid #E8E4DE',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = '0 4px 20px rgba(15,35,24,0.1)';
          el.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = '';
          el.style.transform = '';
        }}
      >
        {/* Coloured top bar */}
        <div style={{ height: '4px', background: barColor, flexShrink: 0 }} />

        <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Tag pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {a.tags.slice(0, 2).map(t => (
              <span
                key={t}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: tagColor(t) + '18',
                  color: tagColor(t),
                  fontFamily: 'var(--font-body)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f2318',
              fontFamily: 'var(--font-display)',
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}
          >
            {a.title}
          </h2>

          {/* Excerpt */}
          <p
            style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'var(--font-body)',
              margin: '0 0 14px',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {a.excerpt}
          </p>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9CA3AF',
              fontFamily: 'var(--font-body)',
            }}
          >
            {a.readingTime && <span>{a.readingTime} min read</span>}
            {a.publishedAt && <span>· {formatDate(a.publishedAt)}</span>}
            <span style={{ marginLeft: 'auto', color: '#e8622a', fontWeight: 600, fontSize: '13px' }}>
              → Read article
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: '14px', background: '#fff', border: '1px solid #E8E4DE', overflow: 'hidden' }}>
      <div style={{ height: '4px', background: '#F0EDE8' }} />
      <div style={{ padding: '18px 20px 16px' }}>
        <div style={{ height: '12px', width: '60px', background: '#F0EDE8', borderRadius: '6px', marginBottom: '12px' }} />
        <div style={{ height: '22px', width: '85%', background: '#F0EDE8', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ height: '14px', width: '100%', background: '#F0EDE8', borderRadius: '6px', marginBottom: '6px' }} />
        <div style={{ height: '14px', width: '65%', background: '#F0EDE8', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export default function LearnPage() {
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    getAllArticles()
      .then(data => {
        const list = data as Array<{
          _id: string;
          title: string;
          slug: string;
          excerpt?: string;
          readingTime?: number;
          publishedAt?: string;
          tags?: string[];
        }>;
        if (list && list.length > 0) {
          setArticles(list.map(a => ({
            id: a._id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt ?? '',
            readingTime: a.readingTime ?? 3,
            publishedAt: a.publishedAt ?? '',
            tags: a.tags ?? [],
          })));
        } else {
          // Sanity returned empty — use static fallback
          setArticles(FALLBACK_ARTICLES);
        }
      })
      .catch(() => {
        // Sanity unreachable — use static fallback
        setArticles(FALLBACK_ARTICLES);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = articles;
    if (activeTag !== 'All') {
      result = result.filter(a => a.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, activeTag, search]);

  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>Knowledge Hub – Retirement Planning Guides | CorpusCalc</title>
        <meta name="description" content="Plain English guides on SIPs, corpus strategies, inflation, and Indian tax planning for retirement." />
        <link rel="canonical" href="https://corpuscalc.com/knowledge" />
      </Helmet>
      <style>{LEARN_STYLES}</style>
      <Navbar />

      {/* Hero */}
      <div
        className="learn-hero-section"
        style={{
          background: 'linear-gradient(135deg, #0f2318 0%, #1c3d2a 60%, #0f2318 100%)',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h1
            className="learn-hero-h1"
            style={{
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              margin: '0 0 14px',
              lineHeight: 1.15,
            }}
          >
            Knowledge Hub
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.72)',
              fontFamily: 'var(--font-body)',
              margin: '0 0 32px',
              lineHeight: 1.6,
            }}
          >
            Plain English guides to retirement planning in India. With a global lens.
          </p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="text"
              aria-label="Search articles"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 20px 13px 44px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '15px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                backdropFilter: 'blur(4px)',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '16px',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E4DE', padding: '0 24px' }}>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '14px 0',
            scrollbarWidth: 'thin',
          }}
        >
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTag(tab)}
              style={{
                padding: '7px 18px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                background: activeTag === tab ? '#e8622a' : '#F5F3F0',
                color: activeTag === tab ? '#fff' : '#6B7280',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <div className="container py-10">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {loading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '16px',
              }}
            >
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '16px',
                alignItems: 'start',
              }}
            >
              {filtered.map(a => <ArticleCard key={a.id} a={a} />)}
            </div>
          )}

          {!loading && filtered.length === 0 && articles.length > 0 && (
            <div
              style={{
                borderRadius: '16px',
                background: '#F8F7F4',
                border: '1px dashed #D1D5DB',
                padding: '48px 32px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🔍</p>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                No articles found
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
                Try a different search or filter tab.
              </p>
              <button
                onClick={() => { setSearch(''); setActiveTag('All'); }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0f2318',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div
              style={{
                borderRadius: '16px',
                background: '#F8F7F4',
                border: '1px dashed #D1D5DB',
                padding: '48px 32px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📚</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                No articles yet
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
                We are writing in-depth guides on SIPs, corpus strategies, and Indian tax planning.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
