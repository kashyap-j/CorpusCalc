import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortableText } from '@portabletext/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getArticleBySlug, urlFor } from '../lib/sanity';

// ─── Types ────────────────────────────────────────────────────────────
type SanityArticle = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  readingTime?: number;
  publishedAt?: string;
  tags?: string[];
  featuredImage?: { asset: object; alt?: string };
  youtubeVideos?: string[];
  body?: object[];
  ctaText?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
};

type LocalBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'cta' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string };

type LocalArticle = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  body: LocalBlock[];
};

// ─── Static fallback articles ─────────────────────────────────────────
const FALLBACK_ARTICLES: LocalArticle[] = [
  {
    slug: 'global-wars-retirement-inflation',
    title: 'How Global Wars Are Making Your Retirement More Expensive',
    excerpt: "Russia-Ukraine, Middle East tensions, and supply chain disruptions are quietly eroding your retirement corpus. Here's how to protect it.",
    tags: ['Inflation', 'Strategy'],
    readingTime: 5,
    publishedAt: '2024-11-10',
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
    title: 'The Dollar-Rupee Story: Why Your Retirement Number Keeps Changing',
    excerpt: "Every time the rupee weakens, your imported lifestyle costs more. Here's what a weak rupee means for your retirement plan.",
    tags: ['Strategy', 'Basics'],
    readingTime: 4,
    publishedAt: '2024-11-20',
    body: [
      { type: 'p', text: 'In 2010, one US dollar bought you about ₹45. Today it costs ₹84-85. That is the rupee losing nearly 50% of its value against the dollar in 15 years, roughly 3% annual depreciation, as reliable as the seasons. If you are planning for retirement in India, this is not just a news headline. A structural force is quietly reshaping your cost of living.' },
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
    excerpt: "Chinese economic weakness is rippling through global markets. Indian equity funds are not immune. Here's what long-term investors should know.",
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
    excerpt: "When the US Fed raises interest rates, FIIs pull money out of India. Your SIP feels it. Here's the full picture and why you should keep investing anyway.",
    tags: ['SIP', 'Strategy'],
    readingTime: 5,
    publishedAt: '2024-12-15',
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
    excerpt: "India imports 85% of its oil. Every Middle East flare-up hits your petrol bill, your groceries and quietly your retirement corpus. Here's the math.",
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

// ─── Local body renderer ──────────────────────────────────────────────
function LocalBody({ blocks }: { blocks: LocalBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === 'p') return (
          <p key={i} style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.8, margin: '0 0 18px' }}>{block.text}</p>
        );
        if (block.type === 'h2') return (
          <h2 key={i} style={{ fontSize: '22px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '36px 0 12px', lineHeight: 1.3 }}>{block.text}</h2>
        );
        if (block.type === 'h3') return (
          <h3 key={i} style={{ fontSize: '18px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '28px 0 8px', lineHeight: 1.3 }}>{block.text}</h3>
        );
        if (block.type === 'blockquote') return (
          <blockquote key={i} style={{ borderLeft: '4px solid #e8622a', paddingLeft: '16px', margin: '24px 0', fontStyle: 'italic', color: '#6B7280', fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7 }}>{block.text}</blockquote>
        );
        if (block.type === 'ul') return (
          <ul key={i} style={{ paddingLeft: '20px', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {block.items.map((item, j) => (
              <li key={j} style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{item}</li>
            ))}
          </ul>
        );
        if (block.type === 'callout') return (
          <div key={i} style={{ borderLeft: '4px solid #e8622a', background: '#FFF5F0', borderRadius: '0 8px 8px 0', padding: '16px 18px', margin: '24px 0' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.65 }}>{block.text}</p>
          </div>
        );
        if (block.type === 'cta') return (
          <div key={i} style={{ borderLeft: '4px solid #e8622a', background: '#FFF5F0', borderRadius: '0 12px 12px 0', padding: '18px 20px', margin: '32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Calculate your retirement corpus →</p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>Free, India-specific. No sign-up required.</p>
            </div>
            <Link to="/plan" style={{ display: 'inline-block', padding: '9px 20px', borderRadius: '10px', background: '#e8622a', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Open CorpusCalc
            </Link>
          </div>
        );
        if (block.type === 'table') return (
          <div key={i} style={{ overflowX: 'auto', margin: '24px 0 28px', borderRadius: '8px', border: '1px solid #E8E4DE', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
              <thead>
                <tr>
                  {block.headers.map((h, j) => (
                    <th key={j} style={{ background: '#0f2318', color: '#fff', padding: '11px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, j) => (
                  <tr key={j} style={{ background: j % 2 === 0 ? '#fff' : '#F0FDF4' }}>
                    {row.map((cell, k) => (
                      <td key={k} style={{ padding: '10px 16px', fontSize: '13px', color: '#374151', fontFamily: 'var(--font-body)', borderTop: '1px solid #E8E4DE', lineHeight: 1.5, whiteSpace: 'nowrap' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        return null;
      })}
    </div>
  );
}

// ─── Portable text components (Sanity) ───────────────────────────────
const portableComponents = {
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '32px 0 12px', lineHeight: 1.3 }}>{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '36px 0 12px', lineHeight: 1.3 }}>{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '28px 0 8px', lineHeight: 1.3 }}>{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.8, margin: '0 0 18px' }}>{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote style={{ borderLeft: '4px solid #e8622a', paddingLeft: '16px', margin: '24px 0', fontStyle: 'italic', color: '#6B7280', fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.7 }}>{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ fontWeight: 700, color: '#0f2318' }}>{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: '#e8622a', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{children}</a>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul style={{ paddingLeft: '20px', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol style={{ paddingLeft: '20px', margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li style={{ fontSize: '16px', color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{children}</li>
    ),
  },
};

// ─── Share section ────────────────────────────────────────────────────
function ShareSection({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waText = encodeURIComponent(`${title} — ${window.location.href}`);

  return (
    <div style={{ marginTop: '40px', padding: '24px', borderRadius: '14px', background: '#F8F7F4', border: '1px solid #E8E4DE', textAlign: 'center' }}>
      <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>Found this useful?</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: '#25D366', color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </a>
        <button onClick={handleCopy}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: copied ? '#E8F5E9' : '#fff', border: '1px solid #E8E4DE', color: copied ? '#15803D' : '#374151', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s' }}>
          {copied ? '✓ Copied!' : '🔗 Copy link'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [sanityArticle, setSanityArticle] = useState<SanityArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Static fallback lookup
  const localArticle = useMemo(
    () => FALLBACK_ARTICLES.find(a => a.slug === slug) ?? null,
    [slug]
  );

  useEffect(() => {
    if (!slug) return;
    getArticleBySlug(slug)
      .then(data => {
        if (data) setSanityArticle(data);
      })
      .catch(() => {/* fall through to local */})
      .finally(() => setLoading(false));
  }, [slug]);

  // Prefer Sanity; fall back to local
  const useLocal = !sanityArticle && !!localArticle;
  const isNotFound = !loading && !sanityArticle && !localArticle;

  const title        = sanityArticle?.title ?? localArticle?.title ?? '';
  const excerpt      = sanityArticle?.excerpt ?? localArticle?.excerpt ?? '';
  const tags         = sanityArticle?.tags ?? localArticle?.tags ?? [];
  const readingTime  = sanityArticle?.readingTime ?? localArticle?.readingTime;
  const publishedAt  = sanityArticle?.publishedAt ?? localArticle?.publishedAt ?? '';

  const publishedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const metaTitle         = sanityArticle?.seoTitle || title || 'CorpusCalc';
  const metaDescription   = sanityArticle?.seoDescription || excerpt;
  const metaOgTitle       = sanityArticle?.ogTitle || metaTitle;
  const metaOgDescription = sanityArticle?.ogDescription || metaDescription;
  const canonicalUrl      = typeof window !== 'undefined' ? `${window.location.origin}/knowledge/${slug}` : '';

  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>{metaTitle} | CorpusCalc</title>
        <meta name="description" content={metaDescription} />
        {sanityArticle?.focusKeyword && <meta name="keywords" content={sanityArticle.focusKeyword} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaOgTitle} />
        <meta property="og:description" content={metaOgDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {sanityArticle?.featuredImage?.asset && (
          <meta property="og:image" content={urlFor(sanityArticle.featuredImage.asset as object).width(1200).url()} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaOgTitle} />
        <meta name="twitter:description" content={metaOgDescription} />
      </Helmet>
      <Navbar />

      {/* Loading skeleton */}
      {loading && (
        <div className="container py-16">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ height: '12px', width: '180px', background: '#F0EDE8', borderRadius: '6px', marginBottom: '24px' }} />
            <div style={{ height: '42px', width: '90%', background: '#F0EDE8', borderRadius: '8px', marginBottom: '12px' }} />
            <div style={{ height: '42px', width: '60%', background: '#F0EDE8', borderRadius: '8px', marginBottom: '24px' }} />
            <div style={{ height: '2px', background: '#F0EDE8', borderRadius: '2px', marginBottom: '32px' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '16px', background: '#F0EDE8', borderRadius: '6px', marginBottom: '10px', width: i % 2 === 0 ? '80%' : '100%' }} />
            ))}
          </div>
        </div>
      )}

      {/* 404 */}
      {isNotFound && (
        <div className="container py-16" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📖</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>Article not found</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
            This article may have been moved or doesn't exist yet.
          </p>
          <Link to="/knowledge" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
            Back to Articles
          </Link>
        </div>
      )}

      {/* Article content */}
      {!loading && (sanityArticle || localArticle) && (
        <div className="container py-12">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
              <Link to="/knowledge" style={{ color: '#9CA3AF', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#e8622a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}>
                Knowledge
              </Link>
              <span>›</span>
              <span style={{ color: '#374151' }}>{title}</span>
            </nav>

            {/* Tags + reading time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {tags.map(t => (
                <span key={t} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 11px', borderRadius: '20px', background: '#F0FDF4', color: '#15803D', fontFamily: 'var(--font-body)' }}>{t}</span>
              ))}
              {readingTime && <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>{readingTime} min read</span>}
              {publishedDate && <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>· {publishedDate}</span>}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 20px', lineHeight: 1.2 }}>
              {title}
            </h1>

            {/* Coral divider */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #e8622a 0%, #f5a07a 60%, transparent 100%)', borderRadius: '2px', marginBottom: '28px' }} />

            {/* Excerpt */}
            {excerpt && (
              <p style={{ fontSize: '17px', color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.75, margin: '0 0 32px', fontStyle: 'italic' }}>
                {excerpt}
              </p>
            )}

            {/* Featured image (Sanity only) */}
            {!useLocal && sanityArticle?.featuredImage?.asset && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '32px' }}>
                <img
                  src={urlFor(sanityArticle.featuredImage.asset).width(680).url()}
                  alt={(sanityArticle.featuredImage as { alt?: string }).alt ?? title}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {/* Body — Sanity Portable Text */}
            {!useLocal && sanityArticle?.body && sanityArticle.body.length > 0 && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <PortableText value={sanityArticle.body as any} components={portableComponents} />
            )}

            {/* Body — static fallback */}
            {useLocal && localArticle && (
              <LocalBody blocks={localArticle.body} />
            )}

            {/* Bottom CTA */}
            <div style={{ marginTop: '48px', borderRadius: '16px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 8px', lineHeight: 1.3 }}>
                {sanityArticle?.ctaText ?? 'Ready to plan your retirement?'}
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 18px', lineHeight: 1.6 }}>
                Use CorpusCalc to build a personalised plan — phases, drawdown, and kids goals included.
              </p>
              <Link to="/plan" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: '12px', background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
                Build My Plan →
              </Link>
            </div>

            {/* Share */}
            <ShareSection title={title} />

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
