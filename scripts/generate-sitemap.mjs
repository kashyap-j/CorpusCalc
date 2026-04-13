import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: '55cj92zk',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  { url: 'https://corpuscalc.com/', priority: '1.0', changefreq: 'daily' },
  { url: 'https://corpuscalc.com/knowledge', priority: '0.9', changefreq: 'weekly' },
];

const articles = await client.fetch(
  `*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))] {
    "slug": slug.current,
    publishedAt
  }`
);

console.log(`Fetched ${articles.length} articles from Sanity.`);

const staticXml = staticPages.map(({ url, priority, changefreq }) => `
  <url>
    <loc>${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

const articleXml = articles.map(({ slug, publishedAt }) => `
  <url>
    <loc>https://corpuscalc.com/knowledge/${slug}</loc>
    <lastmod>${publishedAt ? publishedAt.slice(0, 10) : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${articleXml}
</urlset>
`;

const outPath = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');

console.log('public/sitemap.xml written.');

const allUrls = [
  ...staticPages.map(p => p.url),
  ...articles.map(a => `https://corpuscalc.com/knowledge/${a.slug}`),
];
console.log('URLs written to sitemap:');
allUrls.forEach(u => console.log(' ', u));
