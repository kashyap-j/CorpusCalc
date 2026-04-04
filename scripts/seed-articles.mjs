/**
 * seed-articles.mjs
 * Creates all hardcoded articles as DRAFT documents in Sanity CMS.
 *
 * Usage:
 *   SANITY_TOKEN=<your-write-token> node scripts/seed-articles.mjs
 *
 * Get a token at: https://www.sanity.io/manage → project → API → Tokens → Add API token (Editor)
 */

import { createClient } from '@sanity/client';
import crypto from 'crypto';

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID = '55cj92zk';
const DATASET    = 'production';
const TOKEN      = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error('\nError: SANITY_TOKEN environment variable is not set.');
  console.error('Get a token at: https://www.sanity.io/manage → API → Tokens');
  console.error('Then run: SANITY_TOKEN=<token> node scripts/seed-articles.mjs\n');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  useCdn:    false,
  apiVersion: '2024-01-01',
  token: TOKEN,
});

// ── Article data (mirrored from src/data/articles.ts) ────────────────────────

const articles = [
  {
    slug: 'global-wars-retirement-inflation',
    title: 'How Global Wars Are Making Your Retirement More Expensive',
    excerpt:
      "Russia-Ukraine, Middle East tensions, and supply chain disruptions are quietly eroding your retirement corpus. Here's how to protect it.",
    tags: ['Inflation', 'Strategy'],
    readingTime: 5,
    publishedAt: '2024-11-10',
    youtubeVideos: [
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'How Geopolitics Drives Inflation: A Visual Explainer',
        description:
          'A breakdown of how global conflicts transmit into consumer prices, with specific examples from 2022-24.',
      },
    ],
    body: [
      { type: 'p', text: 'Every time a war breaks out somewhere in the world, your grocery bill goes up. That sounds dramatic, but it is economics. The Russia-Ukraine war pushed global wheat prices up 60% in 2022. Houthi attacks on Red Sea shipping lanes in 2024 added 20-30% to container freight costs. All of it eventually shows up in your retirement corpus plan as a number that just is not big enough.' },
      { type: 'h2', text: 'The Oil Connection: Why Wars Hit Your Wallet First' },
      { type: 'p', text: "Oil is the world's most geopolitically sensitive commodity. Supply disruptions from pipeline shutdowns, sanctions or tanker attacks all push markets to price in a risk premium on crude. Brent crude averaged $79 in 2021 and peaked near $127 in the weeks after Russia invaded Ukraine. It stayed elevated well into 2023. Every $10/barrel rise in oil feeds roughly 40-50 basis points of additional inflation into import-dependent economies. India imports over 85% of its crude." },
      { type: 'h2', text: 'The Inflation Chain Reaction' },
      { type: 'p', text: 'Higher oil does not just mean more expensive petrol. It means higher diesel costs for trucks, which pushes up transport costs for every good that moves on Indian roads. That is almost everything. Fertilisers are petroleum-derived, so food production costs rise. Aviation fuel becomes expensive, pushing up airfares. Within six months of a major oil price spike, you see the effects in vegetables, packaged goods, logistics and healthcare. This is the inflation chain. Oil sits at the top.' },
      { type: 'ul', items: ['Crude oil ↑ → Petrol and diesel ↑', 'Diesel ↑ → Truck and transport costs ↑', 'Transport ↑ → Food, goods, medicines ↑', 'Fertiliser (from natural gas) ↑ → Food production cost ↑', 'Manufacturing and logistics ↑ → Consumer Price Index ↑'] },
      { type: 'h2', text: 'Why Indian Inflation Is Now Globally Wired' },
      { type: 'p', text: "Before 2008, Indian inflation was largely driven by domestic monsoon patterns and food production cycles. Today, it is deeply linked to global events. India's CPI hit 7.8% in April 2022, its highest in a decade, driven almost entirely by the Ukraine war, oil prices and global supply chain disruption. The RBI's efforts to control inflation with rate hikes were fighting a fire caused by a war 5,000 kilometres away. That is the new reality for Indian retirement planning." },
      { type: 'h2', text: 'The 1973 Lesson No One Wants to Learn Twice' },
      { type: 'p', text: "In 1973, OPEC's oil embargo against Israel-supporting nations triggered the first global energy crisis. US inflation jumped from 3% to 12% within two years. Retirees with fixed deposits and pension annuities saw their purchasing power collapse. India experienced food inflation above 20% in 1974-75. People who assumed stable 4-5% inflation found their real corpus eroded by 40-50% in less than a decade. The mistake was not the plan. It was the inflation assumption." },
      { type: 'table', headers: ['Conflict', 'Year', 'Oil Price Impact', 'Indian Inflation'], rows: [['Russia-Ukraine War', '2022', '+40%', '7.4%'], ['Gulf War', '1990', '+130%', '13.9%'], ['1973 Oil Crisis', '1973', '+300%', '16.2%']] },
      { type: 'blockquote', text: 'The investors who survived the 1973 crisis were not the smartest or the richest. They were the ones who planned for the possibility that inflation could double.' },
      { type: 'cta' },
      { type: 'h2', text: 'What This Means for Your SIP Return Assumptions' },
      { type: 'p', text: 'Standard retirement calculators often use 6% as the inflation assumption. That number made sense when India was a more insulated economy. But if geopolitical instability keeps Indian inflation at 6.5-7.5% for the coming decade, as many economists now forecast, your real return on equity mutual funds shrinks significantly. At 12% nominal returns with 6% inflation, your real return is roughly 5.7%. At 7% inflation, it drops to 4.7%. That 1% difference means you need 15-20% more corpus to sustain the same monthly draw.' },
      { type: 'callout', text: 'At 7% inflation, ₹1 lakh today = ₹3.87 lakh needed in 20 years. At 7.5%, that number becomes ₹4.25 lakh. Most retirement plans are not built for this.' },
      { type: 'h2', text: 'Plan With 7% Inflation, Not 6%' },
      { type: 'p', text: 'Global supply chains have changed permanently. The energy transition adds costs. Geopolitical risk in oil-supplying regions is not going away. For all these reasons, 7% inflation is the responsible baseline for retirement planning today. Use 7.5% as your stress-test scenario.' },
      { type: 'p', text: 'If your CorpusCalc plan shows ₹5.2 crore at 6% inflation, it will likely show ₹6.5 crore at 7.5%, a ₹1.3 crore gap. That gap represents years of additional saving. The time to discover it is now, not in retirement.' },
      { type: 'p', text: 'Recalculate your retirement corpus using updated inflation assumptions on CorpusCalc. A five-minute recalculation could change how much you invest starting this month.' },
    ],
  },
  {
    slug: 'dollar-rupee-retirement',
    title: "The Dollar-Rupee Story: Why Your Retirement Number Keeps Changing",
    excerpt:
      "Every time the rupee weakens, your imported lifestyle costs more. Here's what a weak rupee means for your retirement plan.",
    tags: ['Strategy', 'Basics'],
    readingTime: 4,
    publishedAt: '2024-11-20',
    body: [
      { type: 'p', text: "In 2010, one US dollar bought you about ₹45. Today it costs ₹84-85. That is the rupee losing nearly 50% of its value against the dollar in 15 years, roughly 3% annual depreciation, as reliable as the seasons. If you are planning for retirement in India, this is not just a news headline. A structural force is quietly reshaping your cost of living." },
      { type: 'h2', text: "The Slow Burn: India's Rupee Depreciation History" },
      { type: 'p', text: "The rupee's decline against the dollar has been almost continuous since India liberalised its economy in 1991. From ₹17 in 1991 to ₹45 in 2010 to ₹85 today, it is a one-directional trend with occasional pauses. The drivers are structural. India runs a persistent current account deficit. Inflation in India consistently outpaces US inflation. Capital flows out during global risk-off periods. Not a crisis. Just a slow, predictable erosion that compounds over decades." },
      { type: 'table', headers: ['Year', '₹ per $', 'Change vs Prior'], rows: [['2000', '₹45', 'Baseline'], ['2010', '₹45', 'Flat (10 years)'], ['2015', '₹65', '-31%'], ['2020', '₹75', '-13%'], ['2024', '₹85', '-12%']] },
      { type: 'h2', text: 'What a Weak Rupee Costs You in Real Life' },
      { type: 'p', text: "Electronics are the most visible: that iPhone or MacBook is priced in dollars. But the rupee's weakness also affects medical equipment (India imports most of it), pharmaceuticals with dollar-denominated ingredients and imported foods like edible oils. Travel becomes expensive too. A Europe trip that cost ₹1.5 lakh in 2015 now costs ₹2.5 lakh for the same itinerary. For retirees who want to travel or access world-class healthcare, rupee depreciation silently erodes affordability year after year." },
      { type: 'h2', text: 'The NRI Advantage: When a Weak Rupee Works in Your Favour' },
      { type: 'p', text: 'For NRIs planning to retire in India, rupee depreciation is actually a tailwind. If you have saved in dollars, pounds or dirhams, your corpus in Indian rupees grows automatically as the currency weakens. An NRI who saved $500,000 in 2010 when the rate was ₹45 had ₹2.25 crore. The same $500,000 in 2025 at ₹85 is worth ₹4.25 crore, without earning a single rupee more. This FX bonus is a powerful argument for NRIs to delay repatriation while earning in hard currency.' },
      { type: 'cta' },
      { type: 'h2', text: 'The Double Squeeze: Rupee and Inflation' },
      { type: 'p', text: 'For Indians who earn and save in rupees, the challenge is a double squeeze. First, inflation erodes purchasing power domestically. If you need ₹80,000/month today, you will need ₹1.45 lakh/month in 20 years at 6% inflation, or ₹1.62 lakh at 7%. Second, imported expenses like medical care, electronics and travel become more expensive as the rupee weakens. The corpus you calculate today needs to absorb both pressures simultaneously.' },
      { type: 'callout', text: 'A ₹10 weakening in the rupee adds roughly 4% to import-linked expenses. For a retiree spending ₹80,000/month, that is ₹3,200 more every month, just from currency movement.' },
      { type: 'blockquote', text: "Every rupee you save today is buying a future that is being gradually, quietly made more expensive by forces outside India's control. Plan accordingly." },
      { type: 'h2', text: 'Building a Currency Buffer Into Your Plan' },
      { type: 'p', text: 'Financial planners who account for currency risk typically recommend adding a 15-20% buffer to your retirement corpus estimate. If CorpusCalc tells you that you need ₹5 crore, consider targeting ₹5.75-6 crore as your real goal. This buffer covers currency-linked cost increases and provides a margin of safety if inflation runs hotter than your base assumption.' },
      { type: 'p', text: 'The rupee is not broken. Rupees just do this over time. Use CorpusCalc to model your plan with realistic inflation inputs, then add your currency buffer on top. That is how you build a retirement plan that actually survives contact with the real world.' },
    ],
  },
  {
    slug: 'china-slowdown-mutual-funds',
    title: "China's Economy Is Slowing Down. That's Bad News for Your Mutual Funds",
    excerpt:
      "Chinese economic weakness is rippling through global markets. Indian equity funds are not immune. Here's what long-term investors should know.",
    tags: ['Strategy', 'SIP'],
    readingTime: 5,
    publishedAt: '2024-12-01',
    body: [
      { type: 'p', text: "China is the world's second-largest economy and the factory floor for almost everything. When China slows, supply chains seize up, commodity prices fall and emerging market stocks take a hit. Indian equities are no exception. If you are invested in Indian mutual funds, you might wonder what a slowdown in Beijing has to do with your SIP. More than you would think." },
      { type: 'h2', text: 'China at the Centre of Global Supply Chains' },
      { type: 'p', text: 'China accounts for roughly 30% of global manufacturing output. Semiconductors, pharmaceutical APIs, chemical inputs, machinery and solar panels all flow primarily through Chinese factories. India imports over $100 billion worth of goods from China annually. When Chinese production slows, Indian manufacturers face input shortages and cost spikes. When Chinese demand weakens, metal and chemical prices fall. That can help Indian manufacturers but hurts commodity-exporting countries that buy Indian goods.' },
      { type: 'h2', text: 'How a China Slowdown Hits Indian Sectors' },
      { type: 'p', text: "The effects are sector-specific. Indian IT companies that serve global clients are affected when a slowing China forces multinationals to cut technology budgets, which reduces contracts for Indian IT firms. Indian pharma faces pressure because China supplies 60-70% of the active pharmaceutical ingredients that Indian companies need. The metals sector is hit hard. Tata Steel and JSPL track global steel prices, which fall when China's property sector contracts. China is the world's largest steel consumer." },
      { type: 'h2', text: 'FII Behaviour and Your NAV' },
      { type: 'p', text: "When China's economy troubles foreign investors, they often sell across all emerging markets simultaneously. In 2023, as China's property crisis deepened and data disappointed, FIIs pulled capital from India, Indonesia and Brazil together in a contagion selling effect. This can cause your mutual fund NAV to drop even when Indian fundamentals are healthy. Frustrating, but that is how global capital flows work. Your SIP keeps buying during these dips, which is exactly the right response." },
      { type: 'cta' },
      { type: 'h2', text: 'Why SIP Investors Should Not Panic' },
      { type: 'p', text: 'The most important lesson from China-driven volatility is this: Indian companies have shown resilience across multiple such cycles. After FII selling in late 2022 drove Nifty down 12% from its peak, the index recovered and hit new all-time highs by mid-2023. Investors who stayed in their SIPs bought more units at lower prices, which is exactly the rupee cost averaging benefit that makes SIPs powerful over the long run.' },
      { type: 'callout', text: 'SIP investors who continued during the 2020 crash saw roughly 2x returns by 2022. Those who paused in March 2020 missed the sharpest part of the recovery.' },
      { type: 'table', headers: ['Event', 'Sensex Drop', 'Recovery Time'], rows: [['2008 Global Crisis', '-52%', '18 months'], ['China Fears 2015', '-22%', '8 months'], ['COVID Crash 2020', '-38%', '5 months']] },
      { type: 'h2', text: 'Asset Allocation in Volatile Times' },
      { type: 'p', text: 'When global headwinds create market volatility, the right response is to review your asset allocation, not abandon your equity investments. If you are 10-15 years from retirement, stay primarily in equity with a 20-30% debt buffer. If you are five years out, shifting to a 50-50 or 40-60 equity-debt split is prudent. But stopping SIPs entirely typically means missing the recovery. It comes faster than you expect.' },
      { type: 'h2', text: 'The 25x Rule Still Works in Volatile Markets' },
      { type: 'p', text: 'The 25x corpus rule means saving 25 times your annual retirement expenses. It accounts for volatility by assuming a 4% annual drawdown, which is conservative. In years where your corpus generates 10% returns, you are building more buffer. In years where it generates 2%, you are drawing down at 4%, still sustainable over the long run.' },
      { type: 'p', text: 'Global volatility creates the dips that long-term equity investors should welcome, not fear. The 25x number does not change because of what is happening in Beijing. Use CorpusCalc to model this with India-specific assumptions and see where you stand.' },
    ],
  },
  {
    slug: 'us-fed-rates-india-sip',
    title: 'US Fed Rate Hikes and Your Indian SIP: The Hidden Connection',
    excerpt:
      "When the US Fed raises interest rates, FIIs pull money out of India. Your SIP feels it. Here's the full picture and why you should keep investing anyway.",
    tags: ['SIP', 'Strategy'],
    readingTime: 5,
    publishedAt: '2024-12-15',
    youtubeVideos: [
      {
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        title: 'US Fed Rate Hikes and Emerging Markets: What Every SIP Investor Should Know',
        description:
          'How Federal Reserve policy transmits into Indian equity markets through FII flows, currency and interest rates.',
      },
    ],
    body: [
      { type: 'p', text: 'In 2022, the US Federal Reserve hiked interest rates from near zero to 4.5%. It was one of the most aggressive tightening cycles in modern history. American investors, seeing high-yielding US bonds suddenly available, began selling riskier assets, including Indian equities. Foreign institutional investors sold a net ₹1.21 lakh crore from Indian equity markets that year. Your mutual fund NAV went down. Many investors panicked and stopped their SIPs, right at the worst possible moment.' },
      { type: 'h2', text: 'What FII Outflows Actually Mean' },
      { type: 'p', text: "FIIs (foreign institutional investors) manage trillions of dollars globally. When US interest rates rise, the risk-free return from US Treasury bonds increases. This makes riskier assets like Indian equities less attractive on a relative basis. FIIs rebalance their portfolios, selling Indian stocks and moving money back to US bonds. This is why Nifty and Sensex often react sharply to US Fed announcements, even when India's own fundamentals have not changed at all." },
      { type: 'h2', text: 'The 2022 FII Exodus: Numbers That Scared Investors' },
      { type: 'p', text: "FIIs sold approximately ₹1.21 lakh crore of Indian equities in 2022, one of the largest net selling episodes in India's market history at that time. Nifty 50 fell from a high of 18,604 in January to a low of 15,183 in June, an 18% peak-to-trough decline. Investors who had started SIPs during the 2020-2021 bull run suddenly saw their portfolios in the red. Many paused or stopped their SIPs. This was a costly mistake, as the data clearly shows." },
      { type: 'table', headers: ['Fed Rate Hike Cycle', 'FII Outflow from India', 'Nifty Impact'], rows: [['2013 Taper Tantrum', '₹40,000 Cr', '-8%'], ['2018 Rate Hikes', '₹33,000 Cr', '-12%'], ['2022 Rate Hikes', '₹1,60,000 Cr', '-16%']] },
      { type: 'h2', text: 'Rupee Cost Averaging: Your Best Weapon' },
      { type: 'p', text: 'SIPs work on a beautifully simple principle: you invest a fixed amount every month, regardless of market levels. When markets are high, you buy fewer units. When markets are low, you buy more units. A sustained period of FII-driven market decline is actually a gift for SIP investors. You are accumulating more units at lower prices. An investor who continued their SIP throughout 2022 entered 2023 with a significantly lower average cost per unit and captured the full recovery.' },
      { type: 'cta' },
      { type: 'h2', text: 'What Happened to Investors Who Paused Their SIP in 2022' },
      { type: 'p', text: 'An investor with a ₹20,000/month SIP in a Nifty 50 index fund who paused for six months (June-November 2022) missed investing ₹1.2 lakh. Nifty recovered 24% from its June 2022 low to December 2022. The investor who stayed in the SIP accumulated more units at the bottom and captured that full recovery. The investor who paused bought back at higher levels, missed the cheapest period and effectively locked in losses. Over 20 years, such pauses compound into a significant corpus difference.' },
      { type: 'callout', text: 'Investors who paused their SIP in 2022 missed the 2023 Nifty rally of +19%. A ₹20,000/month SIP paused for 6 months means roughly ₹18,000 in lost recovery gains.' },
      { type: 'blockquote', text: 'The investors who build the most wealth from SIPs are not the ones who time the market. They are the ones who refuse to stop when it gets uncomfortable.' },
      { type: 'h2', text: 'Geopolitical Dips Are SIP Opportunities' },
      { type: 'p', text: 'Whether it is a US Fed rate hike cycle, a China crisis or Middle East tensions, each geopolitical event that causes market volatility is an opportunity to accumulate at lower prices. The data is consistent. Every major market decline in India in the last 30 years (2008, 2013, 2016, 2020, 2022) was followed by a recovery to new highs within two to four years. The investors who stayed invested through each cycle are the ones whose retirement corpus looks the best today.' },
      { type: 'p', text: 'The global macroeconomic environment will always be uncertain. US Fed policy, Chinese growth and oil prices will always create volatility. Your SIP does not need certainty. It needs time and consistency. Keep your SIP running, review your asset allocation annually and use CorpusCalc to stress-test your plan against different market scenarios.' },
    ],
  },
  {
    slug: 'oil-price-retirement-india',
    title: 'Oil at $100 Again? How Middle East Tensions Are Reshaping Indian Retirement Planning',
    excerpt:
      "India imports 85% of its oil. Every Middle East flare-up hits your petrol bill, your groceries and quietly your retirement corpus. Here's the math.",
    tags: ['Inflation', 'Basics'],
    readingTime: 4,
    publishedAt: '2025-01-05',
    body: [
      { type: 'p', text: "India is the world's third-largest consumer of crude oil, and it imports roughly 85% of what it needs. The Middle East supplies most of that oil, so every disruption there affects India's energy security. The cost of your retirement is connected to these events in ways that are not always obvious until they show up in your monthly budget." },
      { type: 'h2', text: "India's Oil Import Dependency: A Structural Vulnerability" },
      { type: 'p', text: "Unlike the United States, which achieved near energy independence through shale production, India has no such luxury. We import primarily from Saudi Arabia, Iraq, UAE and Russia, all regions with significant geopolitical risk. When the Israel-Hamas conflict escalated in October 2023, Brent crude briefly spiked above $95/barrel. Houthi attacks on Red Sea shipping in early 2024 forced tankers to reroute via the Cape of Good Hope. That added 15-20 days and 20-25% to shipping costs. India's imported inflation mechanism was immediately activated." },
      { type: 'h2', text: 'The Transmission Mechanism: From Oil Well to Your Grocery Bag' },
      { type: 'p', text: "Here is how it works. Rising crude oil prices push up petrol and diesel prices in India. Higher diesel raises the operating cost of every truck, tractor and transport vehicle in the country. This pushes up the cost of moving food from farms to cities. Simultaneously, fertiliser prices rise because nitrogen-based fertilisers are made from natural gas, which closely tracks oil prices. The result: vegetable prices, grain prices and processed food prices all rise. The inflation does not stop at food. It flows into manufacturing, logistics and services." },
      { type: 'ul', items: ['Crude oil ↑ → Diesel and petrol prices ↑', 'Diesel ↑ → Farm-to-city transport costs ↑ 20-30%', 'Natural gas ↑ → Fertiliser prices ↑ → Farm input costs ↑', 'Transport + farm costs ↑ → Vegetables, grains, packaged food ↑', 'Manufacturing costs ↑ → Consumer durables, medicines ↑'] },
      { type: 'h2', text: 'The ₹10/Litre Reality Check' },
      { type: 'p', text: "India's retail petrol prices change less frequently than global crude due to political considerations, but they do eventually adjust. When crude sustains above $90-100 per barrel for six months, petrol prices in Indian cities tend to rise ₹5-15 per litre. A ₹10/litre increase translates to roughly ₹0.50-0.80 more per kilometre for personal vehicles. For a family spending ₹8,000/month on fuel, that is an additional ₹1,200-1,600 per month. The knock-on effects on delivered goods add another ₹2,000-4,000 to monthly costs." },
      { type: 'table', headers: ['Oil Price', 'Petrol (Delhi approx.)', 'Effect on ₹80K Budget'], rows: [['$70/barrel', '₹94/litre', 'Baseline'], ['$90/barrel', '₹103/litre', '+₹2,400/month'], ['$110/barrel', '₹112/litre', '+₹4,800/month']] },
      { type: 'callout', text: "India imports 85% of its oil. Every $10 rise in crude adds roughly 0.4% to consumer inflation. At $110/barrel, that is nearly 1.5% extra inflation baked into your retirement budget." },
      { type: 'cta' },
      { type: 'h2', text: 'What This Means for Your Retirement Expense Projections' },
      { type: 'p', text: "If you have planned for ₹80,000/month in today's money and modelled 6% annual inflation, your corpus calculation may be exposed. That ₹80,000 already underestimates the lifestyle cost of a middle-class Indian retirement that includes petrol, delivered groceries, travel and healthcare. Adding oil-price-driven inflation at 7-7.5% pushes that number to ₹1.2 lakh in 15 years, not the ₹1.05 lakh that 6% inflation would predict. That 15% gap, compounded over 20 years of retirement, represents several crores in additional corpus requirement." },
      { type: 'blockquote', text: "₹80,000 a month in today's money could require ₹3.4 lakh a month in 20 years if inflation averages 7.5%. The corpus to sustain that is very different from the one most people are building." },
      { type: 'h2', text: 'Planning With 7.5% Inflation: The Conservative Choice' },
      { type: 'p', text: "Given India's oil import dependency and the structural persistence of Middle East geopolitical risk, retirement planners who model with 7% or 7.5% inflation are not being alarmist. They are being prudent. ₹80,000/month today becomes ₹2.57 lakh at 6% inflation in 20 years. At 7.5%, it becomes ₹3.39 lakh, a 32% difference. The corpus required to sustain ₹3.39 lakh/month is substantially larger. Build in the higher assumption now." },
      { type: 'p', text: "India's dependency on imported oil is decreasing slowly. EVs, renewable energy and efficiency improvements will reduce exposure over the coming decades. But for anyone planning retirement in the next 10-20 years, oil prices remain a major risk to your inflation assumptions. Recalculate your corpus on CorpusCalc with 7.5% inflation and see how it changes your monthly SIP requirement. That one input change could be the most important financial planning decision you make this year." },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function key() {
  return crypto.randomBytes(8).toString('hex');
}

/** Generate SEO title: "<title> | CorpusCalc" capped at 60 chars */
function makeSeoTitle(title) {
  const full = `${title} | CorpusCalc`;
  return full.length <= 60 ? full : full.slice(0, 57) + '...';
}

/** Extract the primary focus keyword from title (longest meaningful phrase) */
function extractFocusKeyword(title) {
  // Lowercase, remove punctuation, take first 3-5 meaningful words
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s₹]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'are', 'for', 'your', 'how', 'why', 'that', 'this', 'with'].includes(w));
  return words.slice(0, 4).join(' ');
}

/** Make OG description: conversational, max 150 chars */
function makeOgDescription(excerpt) {
  if (excerpt.length <= 150) return excerpt;
  return excerpt.slice(0, 147) + '...';
}

/** Convert a single ArticleBlock to one or more Portable Text blocks */
function blockToPortableText(block) {
  switch (block.type) {
    case 'p':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: key(), text: block.text, marks: [] }],
        },
      ];

    case 'h2':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'h2',
          markDefs: [],
          children: [{ _type: 'span', _key: key(), text: block.text, marks: [] }],
        },
      ];

    case 'h3':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'h3',
          markDefs: [],
          children: [{ _type: 'span', _key: key(), text: block.text, marks: [] }],
        },
      ];

    case 'blockquote':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'blockquote',
          markDefs: [],
          children: [{ _type: 'span', _key: key(), text: block.text, marks: [] }],
        },
      ];

    // Bullet list: each item becomes a separate list block
    case 'ul':
      return block.items.map((item) => ({
        _type: 'block',
        _key: key(),
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: [{ _type: 'span', _key: key(), text: item, marks: [] }],
      }));

    // CTA: render as a bold callout paragraph
    case 'cta':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: key(),
              text: '→ Try CorpusCalc: Calculate your personalised retirement corpus',
              marks: ['strong'],
            },
          ],
        },
      ];

    // Callout: render as a blockquote so it stands out visually
    case 'callout':
      return [
        {
          _type: 'block',
          _key: key(),
          style: 'blockquote',
          markDefs: [],
          children: [{ _type: 'span', _key: key(), text: `📌 ${block.text}`, marks: [] }],
        },
      ];

    // Table: convert to @sanity/table format
    case 'table':
      return [
        {
          _type: 'table',
          _key: key(),
          rows: [
            // Header row
            {
              _type: 'tableRow',
              _key: key(),
              cells: block.headers,
            },
            // Data rows
            ...block.rows.map((row) => ({
              _type: 'tableRow',
              _key: key(),
              cells: row,
            })),
          ],
        },
      ];

    default:
      return [];
  }
}

/** Convert an array of ArticleBlocks to Portable Text */
function toPortableText(blocks) {
  return blocks.flatMap(blockToPortableText);
}

// ── Build Sanity document ─────────────────────────────────────────────────────

function buildSanityDoc(article) {
  const seoTitle       = makeSeoTitle(article.title);
  const seoDescription = article.excerpt.slice(0, 160);
  const focusKeyword   = extractFocusKeyword(article.title);
  const ogDescription  = makeOgDescription(article.excerpt);

  const doc = {
    _type: 'article',
    // Draft: _id prefixed with "drafts." means Sanity stores it as a draft
    _id: `drafts.${article.slug}`,
    title: article.title,
    slug: { _type: 'slug', current: article.slug },
    excerpt: article.excerpt,
    readingTime: article.readingTime,
    publishedAt: `${article.publishedAt}T00:00:00.000Z`,
    tags: article.tags,
    body: toPortableText(article.body),
    ctaText: 'Try it in CorpusCalc',
    seoTitle,
    seoDescription,
    focusKeyword,
    ogTitle: article.title,
    ogDescription,
  };

  // YouTube videos (field names match studio schema: videoUrl, videoTitle, videoDescription)
  if (article.youtubeVideos && article.youtubeVideos.length > 0) {
    doc.youtubeVideos = article.youtubeVideos.map((v) => ({
      _type: 'object',
      _key: key(),
      videoUrl: v.url,
      videoTitle: v.title,
      videoDescription: v.description,
    }));
  }

  return doc;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n── CorpusCalc Article Seeder ──────────────────────────────');
  console.log(`Project: ${PROJECT_ID}  Dataset: ${DATASET}`);
  console.log(`Articles to create: ${articles.length}\n`);

  const results = [];

  for (const article of articles) {
    const doc = buildSanityDoc(article);
    try {
      await client.createOrReplace(doc);
      results.push({ ok: true, title: article.title, slug: article.slug });
      console.log(`✓ Created draft: "${article.title}"`);
      console.log(`  slug: ${article.slug}`);
    } catch (err) {
      results.push({ ok: false, title: article.title, slug: article.slug, error: err.message });
      console.error(`✗ Failed: "${article.title}"`);
      console.error(`  ${err.message}`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const ok      = results.filter((r) => r.ok);
  const failed  = results.filter((r) => !r.ok);

  console.log('\n── Summary ────────────────────────────────────────────────');
  console.log(`Created: ${ok.length} / ${articles.length}`);

  if (ok.length > 0) {
    console.log('\nCreated articles:');
    ok.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      console.log(`     slug: ${r.slug}`);
    });
  }

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach((r) => {
      console.log(`  ✗ ${r.title}`);
      console.log(`    ${r.error}`);
    });
  }

  console.log('\nAll drafts are unpublished. Open Sanity Studio to add');
  console.log('cover images and publish when ready.\n');
}

main().catch((err) => {
  console.error('\nUnhandled error:', err.message);
  process.exit(1);
});
