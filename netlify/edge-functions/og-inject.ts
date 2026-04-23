import type { Context } from "https://edge.netlify.com";

const BOT_AGENTS = [
  'whatsapp', 'twitterbot', 'facebookexternalhit', 'linkedinbot',
  'telegrambot', 'slackbot', 'discordbot', 'googlebot', 'bingbot'
];

const SANITY_PROJECT_ID = '55cj92zk';
const SANITY_DATASET = 'production';

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

async function fetchArticleOG(slug: string) {
  const query = encodeURIComponent(
    `*[_type == "article" && slug.current == "${slug}"][0]{
      title, excerpt, ogTitle, ogDescription, seoDescription,
      featuredImage { asset->{ url } }
    }`
  );
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.result;
}

export default async function handler(req: Request, context: Context) {
  const ua = req.headers.get('user-agent') ?? '';
  if (!isBot(ua)) return context.next();

  const url = new URL(req.url);
  const articleMatch = url.pathname.match(/^\/knowledge\/([^/]+)$/);
  if (!articleMatch) return context.next();

  const slug = articleMatch[1];

  let article: {
    title?: string;
    excerpt?: string;
    ogTitle?: string;
    ogDescription?: string;
    seoDescription?: string;
    featuredImage?: { asset?: { url?: string } };
  } | null = null;

  try {
    article = await fetchArticleOG(slug);
  } catch {
    return context.next();
  }

  if (!article) return context.next();

  const title = article.ogTitle || article.title || 'CorpusCalc';
  const description = article.ogDescription || article.seoDescription || article.excerpt || '';
  const image = article.featuredImage?.asset?.url || 'https://corpuscalc.com/og-image.png';
  const pageUrl = `https://corpuscalc.com/knowledge/${slug}`;

  const res = await context.next();
  const html = await res.text();

  const injected = `
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="628" />
    <meta property="og:site_name" content="CorpusCalc" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />`;

  const patched = html.replace('</head>', `${injected}\n</head>`);

  return new Response(patched, {
    status: res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      'content-type': 'text/html; charset=utf-8',
    },
  });
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
