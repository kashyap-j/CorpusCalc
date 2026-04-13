import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>Disclaimer | CorpusCalc</title>
        <meta name="description" content="CorpusCalc is for educational purposes only. Read our full disclaimer before making any investment decisions." />
      </Helmet>
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
            SEBI</strong> as an Investment Advisor, Portfolio Manager, or Research Analyst. We hold
            no licence or authorisation from SEBI, IRDAI, PFRDA, RBI, or any other Indian regulatory
            body to provide financial or investment advisory services.
          </p>
        </Section>

        <Section title="2. Educational Purpose Only">
          <p>
            All content on CorpusCalc — including articles, calculators, and planning tools — is
            designed to build financial literacy, not to direct any specific financial action. The
            information is general in nature and may not apply to your individual circumstances,
            risk appetite, or long-term goals.
          </p>
        </Section>

        <Section title="3. No Guarantee of Accuracy">
          <p>
            We make <strong>no representations or warranties</strong> regarding the accuracy,
            completeness, or timeliness of any content on CorpusCalc. Financial data, tax laws,
            and contribution limits change frequently — always verify figures against official
            government and regulatory sources before acting on them.
          </p>
        </Section>

        <Section title="4. Past Performance Disclaimer">
          <p>
            Any historical returns or example scenarios are for <strong>illustrative purposes
            only</strong> — past performance is <strong>not indicative of future results</strong>.
            All investments are subject to market risks and you may receive back less than you
            originally invested.
          </p>
        </Section>

        <Section title="5. Calculator Outputs Are Projections, Not Promises">
          <p>
            Calculator outputs are based on simplified models and user-supplied inputs, assuming
            constant returns and uninterrupted contributions — none of which are guaranteed in
            practice. Real-world outcomes will differ due to market volatility, income changes, and
            other unpredictable factors.
          </p>
        </Section>

        <Section title="6. Consult a Qualified Professional">
          <p>
            Before making any financial decision, consult a qualified professional such as a SEBI
            Registered Investment Advisor (RIA), Certified Financial Planner (CFP), Chartered
            Accountant (CA), or IRDAI-licensed insurance advisor. A qualified advisor can assess
            your complete financial picture in ways no calculator or article can replicate.
          </p>
        </Section>

        <Section title="7. No Liability">
          <p>
            CorpusCalc and its operators expressly disclaim all liability for any loss or harm
            arising from reliance on any content or calculator output on this website. Your use
            of CorpusCalc is entirely at your own discretion and risk.
          </p>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
