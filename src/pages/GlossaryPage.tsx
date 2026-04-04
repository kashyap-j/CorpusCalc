import { useState, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

type Term = {
  letter: string;
  term: string;
  short: string;
  full: string;
};

const TERMS: Term[] = [
  { letter: 'A', term: 'Asset Allocation', short: 'How your money is split between asset classes.', full: 'The process of dividing your investments across different asset categories — equity, debt, gold, real estate — based on your risk tolerance, time horizon, and goals. A classic retirement rule of thumb: hold (100 − your age)% in equity.' },
  { letter: 'A', term: 'Alpha', short: 'Excess return above the benchmark.', full: 'A measure of a fund manager\'s ability to generate returns above what the benchmark index delivers. An alpha of 2 means the fund returned 2% more than the index. Positive alpha is what active fund managers aim for.' },
  { letter: 'B', term: 'Benchmark', short: 'The index a fund is compared against.', full: 'A standard index (like Nifty 50 or Sensex) against which a mutual fund\'s performance is measured. If the Nifty 50 returns 12% and your fund returns 14%, you beat the benchmark by 2% (alpha of 2).' },
  { letter: 'B', term: 'Beta', short: 'Sensitivity of a fund to market movements.', full: 'Measures how much a fund moves relative to its benchmark. A beta of 1.2 means the fund rises or falls 1.2× as much as the index. Higher beta = more volatile but potentially higher returns in bull markets.' },
  { letter: 'C', term: 'CAGR', short: 'Compound Annual Growth Rate — the annualised return.', full: 'The smoothed annual return rate that an investment would have earned if it grew steadily. If ₹1 lakh became ₹2.1 lakh in 7 years, the CAGR is about 11.2%. It\'s the most honest way to compare long-term investment performance.' },
  { letter: 'C', term: 'Compound Interest', short: 'Earning returns on your returns.', full: 'The effect where your investment grows not just on the original principal, but also on the accumulated returns. Albert Einstein reportedly called it the eighth wonder of the world. A ₹10,000 SIP at 12% for 30 years creates ₹3.5 Cr — despite only ₹36 lakh invested.' },
  { letter: 'C', term: 'Corpus', short: 'The total retirement nest egg.', full: 'The total accumulated pool of money you need at retirement to fund your expenses for the rest of your life. CorpusCalc uses the 25× rule: multiply your annual retirement expenses by 25 to get your target corpus. This assumes a 4% safe withdrawal rate.' },
  { letter: 'D', term: 'Debt Fund', short: 'A mutual fund investing in bonds and fixed income.', full: 'A mutual fund that invests in fixed-income instruments like government bonds, corporate bonds, treasury bills, and money market instruments. Generally less volatile than equity funds. Returns typically range from 6–9% p.a. In retirement, debt funds or FDs provide stable income.' },
  { letter: 'D', term: 'Diversification', short: 'Spreading risk across multiple assets.', full: 'The strategy of investing across different asset classes, sectors, and geographies to reduce risk. If one investment falls, others may hold up or rise. A well-diversified retirement portfolio typically includes large-cap equity, mid-cap equity, international funds, debt funds, and gold.' },
  { letter: 'D', term: 'Dividend', short: 'A share of profits paid to investors.', full: 'A portion of a company\'s profits distributed to shareholders. In mutual funds, the IDCW (Income Distribution cum Capital Withdrawal) option distributes returns periodically. For retirement income, dividend income is one strategy, though SWP (systematic withdrawal plan) is often more tax-efficient.' },
  { letter: 'E', term: 'ELSS', short: 'Tax-saving equity mutual fund with 3-year lock-in.', full: 'Equity Linked Savings Scheme — a type of diversified equity mutual fund that qualifies for ₹1.5 lakh deduction under Section 80C. Has the shortest lock-in period (3 years) among 80C instruments. Historically delivers 12–15% CAGR over long periods.' },
  { letter: 'E', term: 'EPF', short: 'Mandatory provident fund for salaried employees.', full: 'Employee Provident Fund — both employee and employer contribute 12% of basic salary. The corpus grows at ~8.15% p.a. (tax-free). EPF is a key component of retirement savings for salaried Indians. You can withdraw the full corpus at retirement.' },
  { letter: 'E', term: 'Equity Fund', short: 'A mutual fund investing primarily in stocks.', full: 'A mutual fund that invests at least 65% of its assets in equities (stocks). Sub-categories include large-cap, mid-cap, small-cap, flexi-cap, and sectoral funds. Historically delivers 12–15% CAGR over 10+ year periods. Higher risk, higher return potential.' },
  { letter: 'E', term: 'Expense Ratio', short: 'Annual fee charged by a mutual fund.', full: 'The annual fee charged by a mutual fund as a percentage of AUM, deducted daily from NAV. For direct plans, this is typically 0.05–1%. A 1% expense ratio on a ₹1 Cr corpus eats ₹1 lakh/year. Always prefer direct plans over regular plans.' },
  { letter: 'F', term: 'Fixed Deposit (FD)', short: 'A guaranteed-return bank deposit.', full: 'A deposit with a bank or NBFC at a fixed interest rate for a fixed tenure. Returns are guaranteed (currently 6.5–8.5% p.a.). Ideal for the debt portion of a retirement corpus — capital is preserved and interest income is predictable. Senior citizens get 0.25–0.5% higher rates.' },
  { letter: 'F', term: 'FI/RE', short: 'Financial Independence, Retire Early.', full: 'A movement focused on saving aggressively (often 50–70% of income) to retire much earlier than the traditional age. FI means your passive income covers your expenses. RE means retiring early (often in 30s–40s). CorpusCalc supports planning for any retirement age.' },
  { letter: 'I', term: 'Inflation', short: 'The rate at which prices rise over time.', full: 'The gradual increase in the cost of goods and services over time. India\'s average CPI inflation has been ~6% over the last decade. For retirement planning, this is critical: ₹50,000/month today will require ~₹1.6 lakh/month after 20 years at 6% inflation.' },
  { letter: 'K', term: 'KYC', short: 'Know Your Customer — mandatory identity verification.', full: 'Mandatory compliance process for all financial accounts in India. Requires PAN card, Aadhaar, and a photograph. KYC is a one-time process (CKYC) that applies across all banks and brokers. Must be done before investing in mutual funds or opening a demat account.' },
  { letter: 'L', term: 'Liquidity', short: 'How quickly an asset can be converted to cash.', full: 'The ease with which an investment can be converted to cash without significant loss of value. Savings accounts (highest liquidity) → liquid mutual funds → equity mutual funds → real estate (lowest liquidity). Retirement planning must balance liquidity needs with return optimization.' },
  { letter: 'N', term: 'NAV', short: 'Net Asset Value — price of one mutual fund unit.', full: 'Net Asset Value — the per-unit market value of a mutual fund. Calculated as (total assets − liabilities) / number of units. When you invest ₹10,000 in a fund with NAV ₹50, you get 200 units. NAV changes daily based on market movements.' },
  { letter: 'N', term: 'NPS', short: 'National Pension System — government pension scheme.', full: 'National Pension System — a government-backed pension scheme open to all Indian citizens. Offers tax benefits under Section 80C and additional ₹50,000 under 80CCD(1B). At retirement, 40% must be used to buy an annuity; 60% can be withdrawn tax-free.' },
  { letter: 'P', term: 'PPF', short: 'Public Provident Fund — 15-year tax-free government scheme.', full: 'Public Provident Fund — a government savings scheme with a 15-year tenure and ~7.1% tax-free returns (EEE — Exempt-Exempt-Exempt: contribution, growth, and withdrawal all tax-free). Max ₹1.5 lakh/year. Excellent for the debt portion of long-term retirement savings.' },
  { letter: 'R', term: 'Rebalancing', short: 'Restoring your target asset allocation periodically.', full: 'The process of bringing your portfolio back to its target asset allocation by selling overweight assets and buying underweight ones. E.g., if equity outperforms and reaches 75% vs your 70% target, you sell some equity and buy debt. Typically done annually.' },
  { letter: 'R', term: 'Rule of 72', short: 'A shortcut to estimate how long it takes to double money.', full: 'Divide 72 by the annual return rate to estimate how many years it takes to double your money. At 12%, money doubles every 6 years (72 ÷ 12 = 6). At 7%, every ~10 years. A simple mental math tool for compound interest estimates.' },
  { letter: 'S', term: 'Safe Withdrawal Rate', short: 'The annual % you can withdraw without depleting corpus.', full: 'The percentage of your retirement corpus you can withdraw annually without running out of money. The famous "4% rule" (from the Trinity Study) suggests withdrawing 4% in Year 1 and adjusting for inflation. In India, with higher inflation (~6%), a 3–3.5% rate is often recommended.' },
  { letter: 'S', term: 'SIP', short: 'Systematic Investment Plan — regular fixed investing.', full: 'Systematic Investment Plan — investing a fixed amount in a mutual fund at regular intervals (monthly, weekly). Rupee-cost averaging means you buy more units when prices are low and fewer when high. CorpusCalc\'s core strategy: the right monthly SIP amount, invested consistently, builds your retirement corpus.' },
  { letter: 'T', term: 'Tax Harvesting', short: 'Selling investments to book gains and reduce tax.', full: 'A tax optimization strategy where you sell long-term equity investments before they cross ₹1 lakh LTCG threshold (after which 10% tax applies), book the gain, and immediately reinvest. Resets your cost basis to current market value, reducing future tax. Best done annually.' },
  { letter: 'V', term: 'Volatility', short: 'How much an investment\'s value fluctuates.', full: 'The degree of variation in an investment\'s returns over time. Measured by standard deviation. Equity funds have high volatility (±30% in bad years) but better long-term returns. Debt funds have low volatility. As you approach retirement, reducing portfolio volatility is prudent.' },
  { letter: 'X', term: '25x Rule', short: 'Target corpus = 25 × annual retirement expenses.', full: 'A retirement planning shorthand: to retire comfortably, accumulate at least 25 times your expected annual expenses. This assumes a 4% safe withdrawal rate. E.g., if you need ₹12 lakh/year in retirement, your target corpus is ₹3 Cr. CorpusCalc uses this as the default target.' },
  { letter: 'X', term: 'XIRR', short: 'Internal rate of return for irregular cash flows.', full: 'Extended Internal Rate of Return — a more accurate way to calculate investment returns when cash flows happen at irregular intervals (like SIPs on different dates). Unlike CAGR, XIRR accounts for the exact timing and amount of each investment. Use XIRR in Excel or your broker app to evaluate your SIP returns.' },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const letters = useMemo(() => [...new Set(TERMS.map(t => t.letter))].sort(), []);

  const filtered = useMemo(() => {
    let list = TERMS;
    if (activeLetter) list = list.filter(t => t.letter === activeLetter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.full.toLowerCase().includes(q));
    }
    return list;
  }, [search, activeLetter]);

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container py-12">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#e8622a', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>Reference</p>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 10px', lineHeight: 1.2 }}>
              Retirement Glossary
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 24px', lineHeight: 1.6 }}>
              {TERMS.length} terms every Indian retirement planner should know.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                placeholder="Search terms..."
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
                style={{
                  width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px',
                  border: '1.5px solid #E8E4DE', background: '#fff',
                  fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9CA3AF' }}>×</button>
              )}
            </div>

            {/* Letter filter */}
            {!search && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  onClick={() => setActiveLetter(null)}
                  style={{
                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    fontFamily: 'var(--font-body)', cursor: 'pointer', border: 'none',
                    background: activeLetter === null ? '#0f2318' : '#F8F7F4',
                    color: activeLetter === null ? '#fff' : '#6B7280',
                    transition: 'all 0.15s',
                  }}
                >All</button>
                {letters.map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLetter(l === activeLetter ? null : l)}
                    style={{
                      padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                      fontFamily: 'var(--font-body)', cursor: 'pointer', border: 'none',
                      background: activeLetter === l ? '#0f2318' : '#F8F7F4',
                      color: activeLetter === l ? '#fff' : '#6B7280',
                      transition: 'all 0.15s',
                    }}
                  >{l}</button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
            {filtered.length} term{filtered.length !== 1 ? 's' : ''}
            {activeLetter ? ` starting with ${activeLetter}` : search ? ` matching "${search}"` : ''}
          </p>

          {/* Term list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(t => (
              <div
                key={t.term}
                style={{ borderRadius: '12px', background: '#fff', border: '1px solid #E8E4DE', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setExpanded(expanded === t.term ? null : t.term)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '2px 7px', borderRadius: '5px', background: '#F0FDF4', color: '#15803D', fontFamily: 'var(--font-body)',
                      }}>{t.letter}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{t.term}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>{t.short}</p>
                  </div>
                  <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0, marginTop: '2px' }}>
                    {expanded === t.term ? '▲' : '▼'}
                  </span>
                </button>
                {expanded === t.term && (
                  <div style={{ borderTop: '1px solid #E8E4DE', padding: '14px 16px', background: '#FAFAF8' }}>
                    <p style={{ fontSize: '14px', color: '#374151', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.7 }}>
                      {t.full}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>No terms found. Try a different search.</p>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: '40px', borderRadius: '14px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>Now put the theory to work</p>
            <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>
              Build a personalised retirement plan with phases, corpus deployment, and kids goals.
            </p>
            <a href="/plan" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
              Start Planning →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
