import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
  perspective: 'published',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getAllArticles() {
  const query = `*[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      readingTime,
      publishedAt,
      tags,
      featuredImage { asset, alt }
    }`;

  console.log('[Sanity] client config:', {
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    useCdn: true,
    apiVersion: '2024-01-01',
  });
  console.log('[Sanity] getAllArticles query:', query);

  try {
    const result = await sanityClient.fetch(query);
    console.log('[Sanity] getAllArticles raw response:', result);
    console.log('[Sanity] getAllArticles count:', Array.isArray(result) ? result.length : 'not an array');
    return result;
  } catch (err) {
    console.error('[Sanity] getAllArticles error:', err);
    throw err;
  }
}

export async function getArticleBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      readingTime,
      publishedAt,
      tags,
      featuredImage { asset, alt },
      youtubeVideos,
      body,
      ctaText,
      seoTitle,
      seoDescription,
      focusKeyword,
      ogTitle,
      ogDescription
    }`,
    { slug }
  );
}

export async function getAllGlossaryTerms() {
  return sanityClient.fetch(
    `*[_type == "glossaryTerm"] | order(term asc) {
      _id,
      term,
      letter,
      shortDefinition,
      fullDefinition,
      relatedLink
    }`
  );
}

export async function getFeaturedArticles(limit = 3) {
  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      readingTime,
      publishedAt,
      tags,
      featuredImage { asset, alt }
    }`,
    { limit }
  );
}
