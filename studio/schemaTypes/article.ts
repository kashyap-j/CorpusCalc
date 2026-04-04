import {defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Basics', value: 'Basics'},
          {title: 'SIP', value: 'SIP'},
          {title: 'Retirement', value: 'Retirement'},
          {title: 'Kids', value: 'Kids'},
          {title: 'Inflation', value: 'Inflation'},
          {title: 'Strategy', value: 'Strategy'},
        ],
      },
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'youtubeVideos',
      title: 'YouTube Videos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'videoUrl', title: 'Video URL', type: 'url'}),
            defineField({name: 'videoTitle', title: 'Video Title', type: 'string'}),
            defineField({
              name: 'videoDescription',
              title: 'Video Description',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: {title: 'videoTitle', subtitle: 'videoUrl'},
          },
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Alt Text', type: 'string'})],
        },
        {type: 'table'},
      ],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      initialValue: 'Try it in CorpusCalc',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Appears in Google results. Max 60 characters.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Appears in Google results. Max 160 characters.',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      description: 'Primary keyword this article targets (e.g. "retirement corpus India").',
    }),
    defineField({
      name: 'ogTitle',
      title: 'OG Title',
      type: 'string',
      description: 'Title shown when shared on WhatsApp, Twitter, LinkedIn. Falls back to SEO Title.',
    }),
    defineField({
      name: 'ogDescription',
      title: 'OG Description',
      type: 'text',
      rows: 2,
      description: 'Description shown in social share previews. Falls back to SEO Description.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      subtitle: 'publishedAt',
    },
  },
})
