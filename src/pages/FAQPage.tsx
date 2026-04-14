import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const faqData = [
  {
    category: 'Retirement Planning Basics',
    emoji: '🏦',
    questions: [
      {
        q: 'How much money do I need to retire in India?',
        a: 'It depends on your monthly expenses at the time you retire. A simple starting point is to multiply your expected annual expenses at retirement by 25. So if you expect to spend 5 lakh per year after retirement, you need a corpus of around 1.25 crore. If your retirement is going to last more than 30 years, using 30x or 35x is safer. CorpusCalc helps you calculate this based on your actual current expenses and expected lifestyle.',
      },
      {
        q: 'Is 1 crore enough to retire in India?',
        a: 'For most people in metro cities, 1 crore is not enough for a full retirement. If you spend 40,000 per month today, by the time you retire in 20 years that could become 1.2 lakh per month because of inflation. You would need a corpus of 3 to 4 crore at minimum. 1 crore may work only if you move to a smaller town, have very low expenses, or have other income like rental income or pension.',
      },
      {
        q: 'Is 5 crore enough to retire in India?',
        a: '5 crore is a solid corpus for most people in India. If your annual expenses at retirement are around 10 lakh, a 5 crore corpus using a 4% withdrawal rate gives you 20 lakh per year, which is more than enough with room to spare. For early retirees or people in expensive cities, 5 crore may still feel tight if expenses are high. Always run the numbers for your specific situation.',
      },
      {
        q: 'At what age should I start saving for retirement?',
        a: 'The earlier the better. Starting at 25 gives your money 30 plus years to grow. Starting at 35 still works but you need to invest more every month to reach the same goal. The real difference is not the amount you invest but the time it stays invested. Even a small SIP of 2,000 to 3,000 rupees a month started at 25 can build a solid corpus by retirement.',
      },
      {
        q: 'What is the 25x rule for retirement planning?',
        a: 'The 25x rule says your retirement corpus should be 25 times your annual expenses. This comes from the idea that you can withdraw 4% of your corpus every year and it will last 25 to 30 years. For example, if your annual expenses at retirement are 6 lakh, you need 1.5 crore corpus. In India, because inflation is higher, many planners suggest 30x or 35x for longer retirements.',
      },
      {
        q: 'How do I calculate my retirement corpus?',
        a: 'You need four things: your current monthly expenses, expected inflation rate (6 to 7% in India), years left to retirement, and how long your retirement will last. First calculate your expenses at retirement after inflation. Then multiply by 12 for annual expenses. Then multiply by 25, 30 or 35 depending on how long you expect to live after retirement. CorpusCalc does all this automatically in the planner.',
      },
      {
        q: 'How much should I save every month for retirement?',
        a: 'A rough target is to save at least 20 to 30 percent of your monthly income for retirement. The exact amount depends on your current age, retirement age, existing savings, and expected lifestyle. Use the CorpusCalc planner to get a personalised SIP number based on your actual income and expenses.',
      },
    ],
  },
  {
    category: 'FIRE and Early Retirement',
    emoji: '🔥',
    questions: [
      {
        q: 'What is FIRE and can I achieve it in India?',
        a: 'FIRE stands for Financial Independence, Retire Early. The idea is to save and invest aggressively so you can stop working much earlier than the usual age of 58 to 60. In India it is very much possible but you need a larger corpus because your retirement will be longer. If you retire at 40, your corpus needs to last 40 to 50 years, so most FIRE planners in India use a 35x multiplier instead of 25x.',
      },
      {
        q: 'How much corpus do I need to retire at 40 in India?',
        a: 'If your monthly expenses at 40 will be around 80,000 rupees, your annual expenses are about 9.6 lakh. Using a 35x multiplier for a long retirement, you need around 3.4 crore. But this is just the base number. Add a buffer for healthcare, kids education, and unexpected expenses. Most people targeting FIRE at 40 in India aim for 4 to 6 crore depending on their lifestyle.',
      },
      {
        q: 'What is Lean FIRE, Fat FIRE and Barista FIRE?',
        a: 'Lean FIRE means retiring with a minimal corpus that covers only basic needs, usually after moving to a lower cost city or town. Fat FIRE means retiring with a large corpus that supports a comfortable or even luxurious lifestyle with no compromises. Barista FIRE is a middle path where you leave your main high-stress job but do some part-time or freelance work to cover a part of your expenses, so your corpus does not have to do all the heavy lifting.',
      },
      {
        q: 'Which investments work best for FIRE in India?',
        a: 'For the saving phase while building the corpus, equity mutual funds through SIP give the best long-term returns, typically 11 to 13% over 15 plus years. Index funds are popular for FIRE because of low cost and good long-term returns. For the withdrawal phase after retirement, a mix of equity and debt helps balance growth and stability. NPS, PPF and ELSS also play a role in reducing your tax burden during the saving phase.',
      },
      {
        q: 'How is FIRE different from normal retirement planning?',
        a: 'In normal retirement planning you work till 58 to 60 and have 25 to 30 years of retirement. In FIRE you might stop working at 35 to 45 and need the corpus to last 40 to 50 years. This means you need a much bigger corpus, a higher savings rate (40 to 60% of income), and very consistent investment habits. The math is harder but very doable if you start early and keep your expenses in check.',
      },
    ],
  },
  {
    category: 'SIP and Mutual Funds',
    emoji: '📈',
    questions: [
      {
        q: 'How much SIP do I need to build a retirement corpus?',
        a: 'It depends on your target corpus and time available. To build 2 crore in 20 years at 12% annual returns, you need a SIP of around 20,000 per month. To build the same 2 crore in 25 years, you need only about 11,000 per month. Starting earlier makes a big difference. Use the CorpusCalc planner to get your exact SIP number based on your retirement goal.',
      },
      {
        q: 'What is a step-up SIP and should I use it?',
        a: 'A step-up SIP means increasing your SIP amount every year, usually by 10 to 15%. This is recommended because your salary also grows every year and your corpus grows much faster with a step-up. A 10,000 SIP with 10% annual step-up over 20 years builds almost double the corpus compared to a flat 10,000 SIP. Whenever you get a salary hike, increase your SIP by the same percentage.',
      },
      {
        q: 'What returns can I expect from equity mutual funds in India?',
        a: 'Historically, diversified equity mutual funds in India have given 11 to 13% CAGR over long periods of 15 plus years. Index funds tracking Nifty 50 have given around 12% CAGR over the last 20 years. These are past returns and future returns may vary. For planning purposes, using 11 to 12% for equity and 6 to 7% for debt is a reasonable assumption.',
      },
      {
        q: 'What is the difference between direct and regular mutual fund plans?',
        a: 'Direct plans have no distributor commission so the expense ratio is lower by 0.5 to 1% per year. Over 20 years this difference compounds to a large amount. Regular plans are bought through brokers or agents who earn a commission. If you are comfortable investing on your own through platforms like MF Central, Zerodha Coin or Groww, always choose direct plans to keep more of your returns.',
      },
      {
        q: 'Is SIP better than lumpsum investment?',
        a: 'For most salaried people, SIP is better because it invests a fixed amount every month regardless of market conditions. When markets fall, you buy more units. When markets rise, your existing units grow in value. Lumpsum works better if you have a large amount and invest it when markets are low. For retirement planning over many years, SIP is more practical and consistent.',
      },
    ],
  },
  {
    category: 'Inflation and Real Returns',
    emoji: '💸',
    questions: [
      {
        q: 'How does inflation affect retirement planning in India?',
        a: 'Inflation reduces the purchasing power of your money over time. If inflation is 6% per year, something that costs 50,000 today will cost around 1.6 lakh in 20 years. This is why your retirement corpus calculation must be based on your future expenses at inflated prices, not today prices. Most retirement planners in India use 6 to 7% as the expected inflation rate.',
      },
      {
        q: 'What inflation rate should I use for retirement planning in India?',
        a: 'India average CPI inflation over the last 15 years has been around 6 to 7%. For general everyday expenses use 6%. For healthcare and education use 8 to 10% because these rise faster than general inflation. CorpusCalc uses 6% as the default inflation rate but you can adjust it based on your expected lifestyle.',
      },
      {
        q: 'What is real rate of return and why does it matter?',
        a: 'Real rate of return is your investment return minus inflation. If your mutual fund gives 12% and inflation is 6%, your real return is only 6%. This is what actually grows your wealth. A savings account giving 4% with 6% inflation has a real return of minus 2%, meaning your money is losing value in real terms. Always compare investments on real returns, not just the number shown.',
      },
      {
        q: 'Why does healthcare inflation matter more in retirement planning?',
        a: 'After retirement, healthcare becomes one of the biggest expenses. Medical costs in India have been rising at 10 to 14% per year, much faster than general inflation. A procedure costing 2 lakh today could cost 6 to 8 lakh in 20 years. This is why retirement planners always suggest having a separate health insurance policy with a large sum insured plus a dedicated health emergency fund on top of your regular corpus.',
      },
    ],
  },
  {
    category: 'PPF, NPS, EPF and Tax Saving',
    emoji: '🏛️',
    questions: [
      {
        q: 'PPF vs NPS vs ELSS: which is better for retirement?',
        a: 'All three serve different purposes. PPF gives guaranteed returns (around 7.1%), is completely tax free and has no market risk but has a 15 year lock-in and a yearly cap of 1.5 lakh. NPS gives market-linked returns and has an extra tax deduction of 50,000 under 80CCD(1B) but 40% of your corpus must be used to buy an annuity at retirement. ELSS gives the best long-term returns (12 to 14%) with only 3 year lock-in but returns are market-linked. A good retirement plan uses all three in different proportions.',
      },
      {
        q: 'Should I invest in NPS for retirement?',
        a: 'NPS is worth considering mainly for the extra tax saving. The additional 50,000 deduction under 80CCD(1B) is over and above the 1.5 lakh 80C limit. If you are in the 30% tax bracket, this saves you 15,000 in tax every year. The downside is the mandatory annuity at retirement where 40% of your corpus must be used to buy an annuity which gives lower returns. NPS works best as one part of your retirement portfolio, not the only instrument.',
      },
      {
        q: 'How much does EPF contribute to my retirement corpus?',
        a: 'EPF is often underestimated. 12% of your basic salary goes into EPF every month and your employer contributes the same amount. EPF currently earns around 8.25% interest per year which is tax free up to certain limits. For someone with a basic salary of 50,000 per month, around 12,000 goes into EPF every month. Over 30 years this alone can build a corpus of 4 to 5 crore. Always check your EPF passbook and make sure your employer is depositing on time.',
      },
      {
        q: 'Is PPF still worth investing in?',
        a: 'Yes, PPF is still worth investing in for the tax-free guaranteed return and as the safe debt portion of your retirement portfolio. Even though the return of 7.1% is lower than equity, the tax-free nature makes the effective return competitive with taxable fixed income options. The strict lock-in of 15 years also builds financial discipline. Most planners suggest maxing out PPF every year as the safe anchor of your portfolio.',
      },
      {
        q: 'What is the tax benefit of NPS under Section 80CCD?',
        a: 'NPS gives two tax deductions. Under 80CCD(1), contributions up to 10% of salary are deductible within the overall 1.5 lakh 80C limit. Under 80CCD(1B), there is an additional deduction of up to 50,000 per year completely separate from the 80C limit. So you can get tax deduction on up to 2 lakh per year through NPS. If your employer also contributes to NPS under 80CCD(2), that is an extra deduction with no upper cap.',
      },
    ],
  },
  {
    category: 'Saving for Kids',
    emoji: '👨‍👩‍👧',
    questions: [
      {
        q: 'How much should I save for my child college education in India?',
        a: 'A good engineering or medicine course at a decent private college costs 10 to 20 lakh today. With education inflation at 8 to 10% per year, the same course could cost 30 to 60 lakh in 15 years. For IITs, current fees are lower but private alternatives are expensive. Start a dedicated SIP for each child as early as possible. Even 5,000 per month started when the child is born can build 25 to 30 lakh by the time they turn 18.',
      },
      {
        q: 'Should I use a separate SIP for my child education or combine it with retirement savings?',
        a: 'Always keep them separate. This is important for two reasons. First, it gives you clarity on whether each goal is on track. Second, it stops you from dipping into retirement savings for education costs or the other way around. Name your SIPs clearly, like Child Education Goal and Retirement Corpus, so you do not mix them mentally or financially.',
      },
      {
        q: 'At what age should I start saving for my child higher education?',
        a: 'Start as early as possible, ideally when the child is born or within the first year. The earlier you start the smaller the monthly SIP needed. If you start when the child is 5, you have 13 years to build the corpus. If you start when they are 12, you only have 6 years and need to invest a much larger amount every month. Even starting with 3,000 to 5,000 per month early on is better than starting late with a large amount.',
      },
      {
        q: 'How do I plan for my child marriage expenses in India?',
        a: 'Marriage costs in India vary widely but a decent wedding in a metro city today costs 10 to 30 lakh. With inflation, this could be 30 to 80 lakh in 20 years. The approach is the same as education planning. Estimate the future cost, decide on a target year, and start a SIP today. CorpusCalc kids planning feature lets you set separate goals for education and marriage for each child and calculates the monthly SIP needed for each.',
      },
    ],
  },
  {
    category: 'Using Your Corpus After Retirement',
    emoji: '🔢',
    questions: [
      {
        q: 'How do I withdraw money from my corpus after retirement?',
        a: 'The simplest approach is the bucket strategy. Keep 1 to 2 years of expenses in a savings account or liquid fund for immediate use. Keep the next 3 to 5 years in debt funds or FDs for medium-term needs. Keep the rest in equity funds for long-term growth. Every year, refill the short-term bucket from the medium-term bucket and the medium-term bucket from equity. This way your equity stays invested long enough to grow.',
      },
      {
        q: 'How do I make sure my corpus lasts my entire life?',
        a: 'Three things help. First, do not withdraw too much too early. A 4% withdrawal rate per year is considered safe for 25 to 30 year retirements. Second, keep a portion in equity even after retirement so your corpus keeps growing above inflation. Third, review your corpus and expenses every year and if markets fall badly in the early years of retirement, temporarily reduce discretionary spending to protect the corpus.',
      },
      {
        q: 'Should I keep retirement money in FD or mutual funds?',
        a: 'A mix of both is best. FDs and debt funds give stable predictable returns and are good for near-term expenses. Equity mutual funds give better long-term returns and help your corpus outlast inflation. A typical allocation for someone in early retirement at age 60 to 70 might be 40% equity and 60% debt, gradually shifting to 20% equity and 80% debt as they get older.',
      },
      {
        q: 'How much should I keep aside for healthcare after retirement?',
        a: 'Healthcare is one of the biggest and most unpredictable expenses in retirement. At minimum, have a health insurance policy with a sum insured of 10 to 25 lakh with a super top-up plan. Also keep a separate healthcare emergency fund of 10 to 20 lakh in a liquid or short-term debt fund. This should be separate from your regular retirement corpus. Do not rely on your children to pay for medical emergencies.',
      },
      {
        q: 'What if I outlive my retirement corpus?',
        a: 'This is called longevity risk and it is a real concern as life expectancy in India is rising. Ways to protect against it include using a larger multiplier (35x instead of 25x) when building the corpus, keeping some equity in the portfolio even during retirement so it keeps growing, buying an annuity with a small part of your corpus for guaranteed lifetime income, and having other income sources like rental property or part-time consulting work in early retirement.',
      },
    ],
  },
];

const allQAs = faqData.flatMap((cat) =>
  cat.questions.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  }))
);

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQAs,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>Retirement Planning FAQ - CorpusCalc</title>
        <meta
          name="description"
          content="Answers to common questions about retirement planning, FIRE, SIP, mutual funds, NPS, PPF, EPF and kids goal planning in India. Plain language, no jargon."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://corpuscalc.com/faq" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Retirement Planning FAQ - CorpusCalc" />
        <meta
          property="og:description"
          content="How much corpus do I need? How much SIP? Is 1 crore enough? Get clear answers to all retirement and FIRE planning questions for India."
        />
        <meta property="og:url" content="https://corpuscalc.com/faq" />
        <meta property="og:image" content="https://corpuscalc.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Retirement Planning FAQ - CorpusCalc" />
        <meta
          name="twitter:description"
          content="How much corpus do I need? How much SIP? Is 1 crore enough? Get clear answers to all retirement and FIRE planning questions for India."
        />
        <meta name="twitter:image" content="https://corpuscalc.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: '700',
              color: '#0f2318',
              marginBottom: '12px',
              lineHeight: '1.2',
            }}
          >
            Retirement Planning — Frequently Asked Questions
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#4a5568',
              lineHeight: '1.7',
              maxWidth: '620px',
              fontFamily: 'var(--font-body)',
            }}
          >
            Plain answers to questions people actually search for — corpus size, SIP amount,
            FIRE in India, PPF vs NPS, kids education savings and more.
          </p>
        </div>

        <nav
          aria-label="Jump to section"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '48px',
          }}
        >
          {faqData.map((cat) => (
            <a
              key={cat.category}
              href={`#${slugify(cat.category)}`}
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid #d1d5db',
                color: '#0f2318',
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.emoji} {cat.category}
            </a>
          ))}
        </nav>

        {faqData.map((cat) => (
          <section
            key={cat.category}
            id={slugify(cat.category)}
            style={{ marginBottom: '52px' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: '600',
                color: '#0f2318',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e8622a',
                display: 'inline-block',
              }}
            >
              {cat.emoji} {cat.category}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cat.questions.map((item) => (
                <details
                  key={item.q}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  <summary
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#0f2318',
                      lineHeight: '1.5',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      userSelect: 'none',
                    }}
                  >
                    <span>{item.q}</span>
                    <span
                      style={{
                        flexShrink: 0,
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#fff5f1',
                        border: '1px solid #e8622a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: '#e8622a',
                        fontWeight: '700',
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: '0 20px 18px',
                      borderTop: '1px solid #f1f5f9',
                      background: '#fafafa',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px',
                        color: '#374151',
                        lineHeight: '1.8',
                        margin: '14px 0 0',
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div
          style={{
            background: '#0f2318',
            borderRadius: '14px',
            padding: '32px 28px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              color: '#fff',
              fontSize: '22px',
              fontWeight: '600',
              marginBottom: '10px',
            }}
          >
            Ready to calculate your retirement corpus?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: '#a0aec0',
              fontSize: '15px',
              marginBottom: '22px',
            }}
          >
            Use the CorpusCalc planner to get your personalised SIP number in under 5 minutes.
          </p>
          <a
            href="/plan"
            style={{
              display: 'inline-block',
              background: '#e8622a',
              color: '#fff',
              padding: '12px 32px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Start Planning
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
