import {defineField, defineType} from 'sanity'

export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'letter',
      title: 'Letter',
      type: 'string',
      description: 'First letter for alphabetical grouping (auto-derive or override)',
    }),
    defineField({
      name: 'shortDefinition',
      title: 'Short Definition',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'fullDefinition',
      title: 'Full Definition',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'relatedLink',
      title: 'Related Link',
      type: 'string',
      description: 'Internal path or external URL for related content',
    }),
  ],
  preview: {
    select: {
      title: 'term',
      subtitle: 'shortDefinition',
    },
  },
})
