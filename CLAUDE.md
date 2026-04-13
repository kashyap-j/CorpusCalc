# CorpusCalc — Developer Reference

India-focused retirement planning SPA. Users build a 6-step retirement plan, run standalone calculators, and read editorial articles. No backend — all computation runs client-side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 (SPA, no SSR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) + inline styles |
| Routing | React Router v7 (`BrowserRouter`) |
| State | Zustand v5 — one store per domain |
| CMS | Sanity v5 (hosted Studio at `corpuscalc.sanity.studio`) |
| Auth & DB | Supabase (anon key, Google OAuth, RLS) |
| SEO | `react-helmet-async` — every page has a `<Helmet>` block |
| Charts | Recharts |
| Animation | Framer Motion |
| PWA | `vite-plugin-pwa` (service worker, manifest, offline support) |
| Fonts | DM Sans (body) + Playfair Display (display headings) via Google Fonts |
| Analytics | Google Analytics 4 (`G-GY2FXFCENN`) via gtag in `index.html` |

---

## Environment Variables

All vars are Vite-style (`VITE_` prefix) and accessed via `import.meta.env`.

Create a `.env` file in the **project root** (not in `studio/`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SANITY_PROJECT_ID=55cj92zk
VITE_SANITY_DATASET=production
```

The `studio/` subdirectory has its own `studio/.env` (gitignored) with the same Sanity vars. `studio/sanity.cli.ts` is also gitignored because it contains the deployment app ID.

---

## Project Structure

```
corpuscalc/
├── src/
│   ├── pages/          # One file per route
│   ├── components/
│   │   ├── layout/     # Navbar, Footer, MobileMenu
│   │   ├── planner/    # Planner step components (Step1–Step7, DeployCorpusUI, etc.)
│   │   ├── auth/       # AuthModal, LoginGate
│   │   └── ui/         # ScrollToTop, etc.
│   ├── lib/
│   │   ├── math.ts     # All corpus/SIP/phase math — pure functions, no side effects
│   │   ├── sanity.ts   # Sanity client + GROQ queries
│   │   └── supabase.ts # Supabase client + table helpers
│   └── store/
│       ├── plannerStore.ts  # Planner state (Zustand + localStorage persist)
│       └── authStore.ts     # Auth state (Zustand, no persist)
├── studio/             # Sanity Studio (separate Vite app inside the monorepo)
│   ├── schemaTypes/
│   │   ├── article.ts
│   │   └── glossaryTerm.ts
│   ├── sanity.config.ts
│   └── sanity.cli.ts   # gitignored
├── scripts/
│   └── generate-sitemap.mjs  # Runs before build, fetches articles from Sanity
├── public/
│   └── sitemap.xml     # Overwritten by generate-sitemap.mjs on every build
└── index.html          # GA4 script, fonts, PWA meta — no static <title> or <meta description>
```

---

## Routes

| URL | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Landing page |
| `/plan` | `PlannerPage` | 6-step retirement planner |
| `/knowledge` | `LearnPage` | Article listing |
| `/knowledge/:slug` | `ArticlePage` | Article detail, fetches from Sanity by slug |
| `/calculators` | redirect | Redirects to `/calculators/sip-calculator` |
| `/calculators/sip-calculator` | `CalculatorsPage` | SIP Growth calculator |
| `/calculators/inflation-calculator` | `CalculatorsPage` | Inflation Reality calculator |
| `/calculators/fd-vs-mf-calculator` | `CalculatorsPage` | FD vs Mutual Fund calculator |
| `/glossary` | `GlossaryPage` | Static glossary (terms hardcoded in component) |
| `/about` | `AboutPage` | About page + feedback form |
| `/auth/callback` | `AuthCallback` | OAuth code exchange, always redirects away |
| `/account` | `AccountPage` | Auth-gated, shows saved plan summary |
| `/privacy` | `PrivacyPage` | Privacy policy |
| `/terms` | `TermsPage` | Terms of use |
| `/disclaimer` | `DisclaimerPage` | Disclaimer |
| `*` | `NotFoundPage` | 404 |

All routes are client-side. The Vite build outputs a standard SPA — the host must redirect all paths to `index.html`.

---

## Key Features

### Planner (`/plan`)
A 6-step wizard with two parallel tabs:
- **Tab 1** — Retirement corpus planning (Steps 1–4, then Step 5 Report → Step 6 Deploy → Step 7 Final)
- **Tab 2** — Kids goals planning (Steps 1–3, then Step 4 Kids → Step 5 Kids Invest → Step 6 Kids Deploy)

Steps:
1. Profile — name, current age, retirement age, life expectancy
2. Financial Picture — existing investments (quick/detailed), salary, additional income
3. Expenses — monthly + annual (quick/detailed breakdown)
4. SIP / Kids — SIP amount and growth mode (Tab 1) OR add kids with education/marriage goals (Tab 2)
5. Report / Kids Invest — corpus result with gap analysis (Tab 1) OR per-kid SIP requirements (Tab 2)
6. Deploy — allocate corpus into instruments (debt/equity) across retirement phases
7. Final — print-ready summary

State persists to `localStorage` under key `corpuscalc-plan-v2` via Zustand `persist` middleware. Only `state` is persisted (not UI state like `showErrors`).

### Math Engine (`src/lib/math.ts`)
All computation is pure TypeScript — no server round-trips. Key functions:
- `compute(S)` — main corpus calculation (Tab 1): grows existing investments, runs month-by-month SIP, computes required corpus using a multiplier (25×/30×/35× based on retirement duration)
- `computeTab2(S)` — Tab 2 variant using `retSipAmt`
- `calcSIPCorpus()` — month-by-month SIP with salary-linked or fixed annual step-up
- `simPhase(ph, instr)` — retirement phase simulation: debt principal constant, interest covers expenses, deficit drawn from equity then debt principal
- `buildPhases(S)` — auto-generates decade-by-decade retirement phases with inflation-adjusted defaults
- `kidGoalCalc()` / `calcAllKidGoals()` — future cost + SIP needed for each kid's UG/PG/marriage goals
- `parseAmt()` — accepts "2L", "50K", "1.5Cr", "rupees 500", commas, etc.
- `fmt()` — formats numbers as ₹ with Indian suffixes (Cr/L/K)

**Do not change math logic without verifying against known outputs.**

### Calculators (`/calculators/*`)
Three standalone calculators in a single `CalculatorsPage` component. Active tab is derived from the URL pathname — no `useState` for tab. Navigating between tabs calls `useNavigate`. Each tab has its own title, meta description, and canonical URL in Helmet.

### Articles (`/knowledge`)
Articles are stored in Sanity CMS. The `ArticlePage` fetches by slug via GROQ. Both Sanity-native articles and a legacy local fallback format (`LocalArticle`) are supported — the page tries Sanity first, falls back to a hardcoded local map.

### Feedback Form (`/about`)
Submits via `supabase.rpc('submit_feedback', { p_name, p_email, p_message })`. Name and email are required. Rate-limited client-side (1 submission per session via a flag).

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_plans` | One row per user. Stores `user_id`, `inputs` (full planner state as JSON), `corpus_result` (number), `updated_at`. Upserted on conflict with `user_id`. |
| `visit_counter` | Single row (`id = 1`) with a `count` column. Incremented via `increment_visit_counter()` RPC on each `/plan` load. |
| `feedback` | Written via `submit_feedback(p_name, p_email, p_message)` RPC. RLS is enforced — the RPC is used instead of direct insert to respect row-level security. |

Auth uses Supabase Google OAuth. The `AuthCallback` page exchanges the OAuth code for a session and redirects to the pre-auth destination stored in `sessionStorage`.

---

## Sanity CMS

**Project ID:** `55cj92zk` | **Dataset:** `production`  
**Studio URL:** `https://corpuscalc.sanity.studio/`  
**API version used by client:** `2024-01-01`

### Document Types

**`article`** — Knowledge hub articles. Fields:
- `title`, `slug` (required), `excerpt` (max 200 chars), `readingTime`, `publishedAt`, `tags`
- `featuredImage` (image with `alt`), `youtubeVideos` (array of `{videoUrl, videoTitle, videoDescription}`)
- `body` — Portable Text array supporting `block`, `image`, and `table` (via `@sanity/table`)
- `ctaText`, `seoTitle` (max 60 chars), `seoDescription` (max 160 chars), `focusKeyword`
- `ogTitle`, `ogDescription`, `author`, `canonicalUrl`

**`glossaryTerm`** — Glossary entries. Fields: `term`, `letter`, `shortDefinition`, `fullDefinition` (Portable Text), `relatedLink`.  
Note: the Glossary page (`/glossary`) currently renders from a **hardcoded static array** in the component, not from Sanity. The schema exists for future use.

### Deploying the Studio
```bash
cd studio
npm install   # first time only
npx sanity deploy
```
`studio/sanity.cli.ts` is gitignored. Never commit it — it contains the deployment `appId`.

---

## Sitemap

`public/sitemap.xml` is **generated dynamically** at build time by `scripts/generate-sitemap.mjs`. It fetches all published articles from Sanity and combines them with static page entries. The file is then copied to `dist/sitemap.xml` by Vite automatically (standard `public/` handling).

The build script is:
```json
"build": "node scripts/generate-sitemap.mjs && tsc -b && vite build"
```

To regenerate the sitemap without a full build:
```bash
node scripts/generate-sitemap.mjs
```

---

## SEO Conventions

- Every page has a `<Helmet>` block with `<title>` and `<meta name="description">`.
- `index.html` has **no** static `<title>` or `<meta name="description">` — react-helmet-async owns those.
- `index.html` does contain static Open Graph, Twitter Card, canonical, and keywords tags (these are site-wide fallbacks).
- Article pages pull `seoTitle`/`seoDescription`/`ogTitle`/`ogDescription` from Sanity fields.
- Calculator sub-pages each have their own canonical URL (`/calculators/sip-calculator`, etc.).

---

## State Management Conventions

- **Planner state** lives entirely in `usePlannerStore` (Zustand). Update via `store.update({ field: value })`. Never mutate state directly.
- `PlannerState` is defined in `src/lib/math.ts` (co-located with the math that uses it).
- **Auth state** lives in `useAuthStore`. It initialises from the existing Supabase session and subscribes to `onAuthStateChange` for the app lifetime — the subscription is intentionally never unsubscribed.
- There is no React Context in this project. Global state = Zustand only.

---

## Styling Conventions

- **Tailwind utility classes** for layout/spacing/colours on the outer shell of pages.
- **Inline styles** for component-level styling (especially inside planner steps and calculators). This is intentional — the planner components were ported from a standalone HTML file and the inline style approach is preserved.
- **CSS variables** for fonts: `var(--font-body)` (DM Sans), `var(--font-display)` (Playfair Display).
- **Colour palette:** `#0f2318` (dark green, primary), `#e8622a` (orange, accent), `#F4C430` (yellow, highlight), `#16A34A` (positive/growth green).
- Do not mix Tailwind and inline styles on the same element.

---

## Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (port 5173, strictPort)
npm run dev

# Build (generates sitemap, TypeScript check, then Vite build)
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173`. Port is strict — if it's already in use the server will not start.

---

## Common Gotchas

- **`import.meta.env` vs `process.env`**: Vite injects `import.meta.env` at build time. Node scripts (e.g. `generate-sitemap.mjs`, `sanity.cli.ts`) run outside Vite and must use `process.env` or hardcoded fallbacks. Using `import.meta.env` in a Node script will silently fail.
- **Sanity drafts**: Documents with `_id` prefixed `drafts.` are drafts and will not appear in the public GROQ query `!(_id in path("drafts.**"))`. Publish in the Studio before they show on the site.
- **Planner math — corpus multiplier**: Required corpus = `annualExpensesAtRetirement × mult`, where `mult` is 25 (≤20yr retirement), 30 (≤30yr), or 35 (>30yr). The corpus is sized on **monthly expenses × 12 only** — yearly one-time expenses are handled separately in phase simulation.
- **Phase simulation**: Debt principal stays constant throughout a phase. Only interest income offsets expenses. Deficit is drawn from equity first, then debt principal. If both are exhausted the simulation stops early and reports `totUnf` (unfunded amount).
- **SIP growth modes**: `flat` = no step-up, `salary` = SIP grows at salary growth %, `fixed` = SIP increases by a fixed annual rupee amount.
- **Glossary data**: Currently hardcoded in `GlossaryPage.tsx`, not fetched from Sanity despite the schema existing.
- **`studio/sanity.cli.ts` is gitignored**: Do not commit it. It contains the deployment `appId`. The file must exist locally for `npx sanity deploy` to work.
