import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {table} from '@sanity/table'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'corpuscalc',

  projectId: (import.meta.env?.VITE_SANITY_PROJECT_ID as string | undefined) ?? '55cj92zk',
  dataset: (import.meta.env?.VITE_SANITY_DATASET as string | undefined) ?? 'production',

  plugins: [structureTool(), visionTool(), table()],

  schema: {
    types: schemaTypes,
  },
})
