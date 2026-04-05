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

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: 'hsl(40 30% 95% / 0.6)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
            Last updated: April 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '760px' }}>

        <div style={{
          background: 'hsl(40 40% 99%)', borderRadius: '1rem', padding: '2rem',
          border: '1px solid hsl(38 20% 90%)', marginBottom: '2rem',
          boxShadow: '0 2px 16px rgba(27, 67, 50, 0.04)',
        }}>
          <p style={{ color: 'hsl(153 30% 22%)', lineHeight: 1.8, fontSize: '15px', margin: 0 }}>
            Please read these Terms of Service carefully before using CorpusCalc. By accessing or
            using our website and tools, you agree to be bound by these terms. If you do not agree,
            please do not use CorpusCalc.
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            These Terms of Service ("Terms") govern your use of CorpusCalc and all associated
            calculators, planners, articles, and features ("Service"). By creating an account or
            using the Service, you confirm that you are at least 18 years old and agree to these Terms.
          </p>
        </Section>

        <Section title="2. Nature of the Service — Not Financial Advice">
          <p>
            CorpusCalc provides <strong>financial calculators and educational content</strong> for
            informational purposes only — all outputs, including corpus projections and SIP estimates,
            do not constitute financial, investment, or tax advice. Always consult a qualified
            financial advisor or SEBI Registered Investment Advisor before making financial decisions.
          </p>
        </Section>

        <Section title="3. User Accounts and Responsibilities">
          <p>
            By creating an account, you agree to provide accurate information, keep your credentials
            secure, and accept full responsibility for all activity under your account. We reserve
            the right to suspend or terminate accounts that violate these Terms.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>
            You agree not to use the Service for any unlawful purpose, reverse-engineer or scrape
            it, interfere with its security or performance, transmit harmful content, or impersonate
            others. Violations may result in immediate account termination.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            All content on CorpusCalc — including text, calculator logic, design, and code — is
            protected under Indian and international copyright laws. You are granted a limited,
            non-exclusive licence for personal, non-commercial use only; reproduction or distribution
            without prior written consent is prohibited.
          </p>
        </Section>

        <Section title="6. Educational Content">
          <p>
            Articles and guides on CorpusCalc are managed through our content system and provided
            for general educational purposes only. We do not guarantee the completeness, accuracy,
            or timeliness of any article.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, CorpusCalc shall not be liable for any damages
            arising from use of the Service, including calculator errors, financial decisions made
            based on this site, or interruptions to availability. Your use of CorpusCalc is entirely
            at your own risk.
          </p>
        </Section>

        <Section title="8. Third-Party Links">
          <p>
            CorpusCalc may contain links to external websites; we are not responsible for their
            content, accuracy, or practices. Linking to an external resource does not constitute
            our endorsement.
          </p>
        </Section>

        <Section title="9. Modifications to the Service">
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service at any
            time, and may update these Terms periodically. Continued use after updates constitutes
            acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of India. Any disputes arising from these Terms
            or your use of CorpusCalc shall be subject to the exclusive jurisdiction of the courts
            located in India.
          </p>
        </Section>


      </div>

      <Footer />
    </div>
  );
}
