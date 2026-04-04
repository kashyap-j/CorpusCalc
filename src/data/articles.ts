export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'cta' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string }

export interface YouTubeVideo {
  url: string;
  title: string;
  description: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  youtubeVideos?: YouTubeVideo[];
  body: ArticleBlock[];
}

export const articles: Article[] = [];
