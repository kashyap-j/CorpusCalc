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

export default function PrivacyPage() {
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
            Privacy Policy
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
            CorpusCalc ("we", "us", or "our") is committed to protecting your personal information.
            This Privacy Policy explains what data we collect, how we use it, and your rights as a user
            of our retirement planning tools. By using CorpusCalc, you agree to the practices described here.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p>
            We collect your email address via our secure authentication provider at sign-up, plus
            your name if you use third-party sign-in. We also collect anonymous usage analytics,
            retirement planner inputs you save, and any feedback you voluntarily submit.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            We use your data to provide the service, authenticate your identity, save planner
            preferences, and improve functionality. We do <strong>not</strong> use your data for
            advertising, profiling, or automated decision-making.
          </p>
        </Section>

        <Section title="3. Authentication">
          <p>
            CorpusCalc uses our secure authentication provider to handle logins — we never store raw
            passwords, and session tokens are kept in your browser's local storage. If you use
            third-party sign-in, only your email and name are stored; no additional account data is
            accessed.
          </p>
        </Section>

        <Section title="4. Data Sharing and Third Parties">
          <p>
            We <strong>do not sell, rent, or trade</strong> your personal information to any third
            party. We share data only with our secure authentication provider (database and auth
            infrastructure) and Sanity.io (content management only — no personal data shared).
          </p>
        </Section>

        <Section title="5. Cookies and Local Storage">
          <p>
            CorpusCalc uses browser <strong>local storage</strong> to persist your session via our
            secure authentication provider and save planner inputs between visits — we do not use
            third-party advertising cookies. You can clear this through your browser settings at any
            time, which will sign you out.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active. Contact us at the
            email below to request deletion of your account and all associated data.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            All data in transit is encrypted via HTTPS/TLS, and our secure authentication provider
            implements row-level security so users can only access their own data. No system is 100%
            secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            CorpusCalc is intended for adults making retirement planning decisions. We do not knowingly
            collect personal information from individuals under 18 years of age.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>
            You may request access, correction, or deletion of your personal data, or withdraw
            consent at any time by deleting your account. Contact us at the email below to exercise
            any of these rights.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time, reflected by updating the "Last
            updated" date at the top. Continued use of CorpusCalc after changes constitutes your
            acceptance of the revised policy.
          </p>
        </Section>

      </div>

      <Footer />
    </div>
  );
}
