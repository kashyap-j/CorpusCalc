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
            retirement planning purposes. All outputs — including corpus projections, SIP estimates,
            inflation-adjusted values, and withdrawal scenarios — are <strong>for informational
            purposes only</strong>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Nothing on CorpusCalc constitutes financial advice, investment advice, tax advice, or
            any professional advisory service. The calculations are based on the inputs you provide
            and simplified mathematical models. They do not account for your individual financial
            situation, tax liabilities, risk tolerance, or personal circumstances.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            You should always consult a qualified financial advisor, chartered accountant, or SEBI
            Registered Investment Advisor (RIA) before making any financial decisions.
          </p>
        </Section>

        <Section title="3. User Accounts and Responsibilities">
          <p>When you create an account, you agree to:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Provide accurate and current information</li>
            <li style={{ marginBottom: '0.5rem' }}>Keep your login credentials secure and confidential</li>
            <li style={{ marginBottom: '0.5rem' }}>Notify us immediately if you suspect unauthorised access</li>
            <li style={{ marginBottom: '0.5rem' }}>Not share your account with others</li>
            <li style={{ marginBottom: '0.5rem' }}>Accept full responsibility for all activity under your account</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            We reserve the right to suspend or terminate accounts that violate these Terms.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Use the Service for any unlawful purpose</li>
            <li style={{ marginBottom: '0.5rem' }}>Attempt to reverse-engineer, scrape, or extract data from the Service</li>
            <li style={{ marginBottom: '0.5rem' }}>Interfere with the security or performance of the Service</li>
            <li style={{ marginBottom: '0.5rem' }}>Transmit harmful, misleading, or offensive content via any feedback channels</li>
            <li style={{ marginBottom: '0.5rem' }}>Impersonate another person or entity</li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            All content on CorpusCalc — including text, articles, calculator logic, design, graphics,
            and code — is the intellectual property of CorpusCalc and is protected under applicable
            Indian and international copyright laws.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            You are granted a limited, non-exclusive, non-transferable licence to access and use the
            Service for your personal, non-commercial retirement planning purposes. You may not
            reproduce, distribute, modify, or create derivative works from any content on CorpusCalc
            without our prior written consent.
          </p>
        </Section>

        <Section title="6. Content from Sanity CMS">
          <p>
            Educational articles and knowledge-base content on CorpusCalc are managed through
            Sanity CMS. This content is provided for general educational purposes and is subject
            to change without notice. We do not guarantee the completeness, accuracy, or timeliness
            of any article.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, CorpusCalc and its operators shall not be
            liable for any direct, indirect, incidental, special, or consequential damages arising
            from your use of the Service, including but not limited to:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Errors or inaccuracies in calculator outputs</li>
            <li style={{ marginBottom: '0.5rem' }}>Financial decisions made based on information from this site</li>
            <li style={{ marginBottom: '0.5rem' }}>Unauthorised access to your account</li>
            <li style={{ marginBottom: '0.5rem' }}>Interruption or unavailability of the Service</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Your use of CorpusCalc is entirely at your own risk.
          </p>
        </Section>

        <Section title="8. Third-Party Links">
          <p>
            CorpusCalc may contain links to external websites or resources. We are not responsible
            for the content, accuracy, or practices of any third-party sites. Linking to an external
            resource does not constitute our endorsement of that resource.
          </p>
        </Section>

        <Section title="9. Modifications to the Service">
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service at any
            time without prior notice. We may also update these Terms periodically. The "Last updated"
            date at the top will reflect the most recent revision. Continued use after updates
            constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of India. Any disputes arising from these Terms
            or your use of CorpusCalc shall be subject to the exclusive jurisdiction of the courts
            located in India.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For questions about these Terms, please contact us at:
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
