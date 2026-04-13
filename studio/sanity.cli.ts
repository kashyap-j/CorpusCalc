import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.VITE_SANITY_PROJECT_ID ?? '55cj92zk',
    dataset: process.env.VITE_SANITY_DATASET ?? 'production',
  },
  deployment: {
    appId: 'kabjmxsr7bkcymzfx2w0t9ka',
    autoUpdates: true,
  }
})
