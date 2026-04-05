import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600,
      color: 'hsl(153 40% 18%)', marginBottom: '0.75rem',
    }}>
      {title}
    </h2>
    <div style={{ color: 'hsl(153 30% 22%)', lineHeight: 1.8, fontSize: '15px' }}>
      {children}
    </div>
  </div>
);

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'hsl(153 40% 18%)', padding: '3.5rem 0 3rem' }}>
        <div className="container">
          <p style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
            color: 'hsl(40 55% 62%)', marginBottom: '0.75rem', fontFamily: 'var(--font-body)',
          }}>
            Legal
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700, color: 'hsl(40 30% 95%)', marginBottom: '0.75rem',
          }}>
            Disclaimer
          </h1>
          <p style={{ color: 'hsl(40 30% 95% / 0.6)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
            Last updated: April 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '760px' }}>

        {/* Prominent notice box */}
        <div style={{
          background: 'hsl(38 80% 96%)', borderRadius: '1rem', padding: '1.5rem 1.75rem',
          border: '1.5px solid hsl(40 55% 75%)', marginBottom: '2.5rem',
          boxShadow: '0 2px 16px rgba(27, 67, 50, 0.04)',
        }}>
          <p style={{
            fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px',
            color: 'hsl(38 50% 40%)', marginBottom: '0.5rem', fontFamily: 'var(--font-body)',
          }}>
            Important Notice
          </p>
          <p style={{ color: 'hsl(38 40% 25%)', lineHeight: 1.8, fontSize: '15px', margin: 0 }}>
            CorpusCalc is <strong>not a SEBI Registered Investment Advisor</strong>. All content,
            calculators, and tools on this website are provided for <strong>educational and
            informational purposes only</strong>. Nothing here constitutes financial advice,
            investment recommendations, or professional guidance of any kind.
          </p>
        </div>

        <Section title="1. Not a Registered Financial Advisor">
          <p>
            CorpusCalc is an independent educational platform and is <strong>not registered with
            the Securities and Exchange Board of India (SEBI)</strong> as an Investment Advisor,
            Portfolio Manager, or Research Analyst under the SEBI (Investment Advisers) Regulations,
            2013 or any other applicable regulation.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            We do not hold any licence, registration, or authorisation from SEBI, IRDAI, PFRDA,
            RBI, or any other regulatory body in India to provide financial, insurance, or
            investment advisory services.
          </p>
        </Section>

        <Section title="2. Educational Purpose Only">
          <p>
            All content on CorpusCalc — including articles, retirement calculators, SIP estimators,
            inflation calculators, withdrawal planners, and the glossary — is designed to help
            individuals <strong>understand concepts</strong> related to retirement planning. It is
            meant to build financial literacy and awareness, not to direct any specific financial action.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            The information presented is general in nature and may not be appropriate or applicable
            to your individual circumstances, financial situation, risk appetite, or long-term goals.
          </p>
        </Section>

        <Section title="3. No Guarantee of Accuracy">
          <p>
            While we make reasonable efforts to ensure that the information and calculator outputs
            on CorpusCalc are accurate and up to date, we make <strong>no representations or
            warranties</strong> — express or implied — regarding the accuracy, completeness,
            timeliness, or suitability of any content.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Financial data, tax laws, contribution limits (e.g., NPS, PPF, EPF), and market
            conditions change frequently. Always verify important figures against official government
            and regulatory sources before acting on them.
          </p>
        </Section>

        <Section title="4. Past Performance Disclaimer">
          <p>
            Any historical returns, benchmark comparisons, or example investment scenarios presented
            on CorpusCalc are for <strong>illustrative purposes only</strong>. Past performance of
            any asset class, index, fund, or investment strategy is <strong>not indicative of
            future results</strong>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Mutual fund investments, equity markets, and other financial instruments are subject to
            market risks. The value of investments can go down as well as up. You may receive back
            less than you originally invested. Please read all scheme-related documents carefully
            before investing.
          </p>
        </Section>

        <Section title="5. Calculator Outputs Are Projections, Not Promises">
          <p>
            The retirement corpus estimates, SIP projections, and withdrawal calculations generated
            by CorpusCalc are based on user-supplied inputs and simplified financial models. They
            assume constant rates of return, fixed inflation, and uninterrupted contributions — none
            of which are guaranteed in practice.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Real-world outcomes will differ from projections due to market volatility, changes in
            income, expenses, inflation, health costs, and other unpredictable factors. These tools
            help you <em>think</em> about retirement planning; they do not <em>plan</em> your retirement.
          </p>
        </Section>

        <Section title="6. Consult a Qualified Professional">
          <p>
            Before making any financial decision — including investing in mutual funds, choosing
            insurance products, contributing to NPS or PPF, or planning your retirement withdrawal
            strategy — you should consult a qualified professional such as:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>A SEBI Registered Investment Advisor (RIA)</li>
            <li style={{ marginBottom: '0.5rem' }}>A Certified Financial Planner (CFP)</li>
            <li style={{ marginBottom: '0.5rem' }}>A Chartered Accountant (CA) for tax planning</li>
            <li style={{ marginBottom: '0.5rem' }}>An IRDAI-licensed insurance advisor for insurance needs</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            A qualified advisor can assess your complete financial picture and provide personalised
            guidance that no general calculator or article can replicate.
          </p>
        </Section>

        <Section title="7. No Liability">
          <p>
            CorpusCalc and its operators expressly disclaim all liability for any loss, damage,
            or harm — financial or otherwise — arising directly or indirectly from reliance on
            any information, calculator output, or content available on this website.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Your use of CorpusCalc is entirely at your own discretion and risk.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            If you have questions about this Disclaimer, please contact us at:
          </p>
          <div style={{
            marginTop: '0.75rem', padding: '1rem 1.25rem', borderRadius: '0.75rem',
            background: 'hsl(38 35% 94%)', border: '1px solid hsl(38 20% 90%)',
          }}>
            <p style={{ margin: 0, fontWeight: 600 }}>CorpusCalc</p>
            <p style={{ margin: '0.25rem 0 0', color: 'hsl(153 40% 18%)' }}>
              contact@corpuscalc.in
            </p>
          </div>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
