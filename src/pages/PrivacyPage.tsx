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
          <p>We collect the following types of information:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Account information:</strong> When you sign up, we collect your email address
              via Supabase Authentication. We may also store your name if provided via OAuth
              (Google sign-in).
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Usage data:</strong> We collect anonymous analytics on which calculators and
              features are used, page views, and general navigation patterns to improve the product.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Planner data:</strong> If you use the retirement planner, your inputs
              (retirement age, corpus goal, monthly savings) may be saved to your account in our
              database to enable persistence across sessions.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Feedback submissions:</strong> If you submit feedback via the About page, we
              store the message and any contact details you voluntarily provide.
            </li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information collected to:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Provide and maintain the CorpusCalc service</li>
            <li style={{ marginBottom: '0.5rem' }}>Authenticate your identity and secure your account</li>
            <li style={{ marginBottom: '0.5rem' }}>Save your planner preferences and calculation history</li>
            <li style={{ marginBottom: '0.5rem' }}>Understand how users interact with our tools to improve functionality</li>
            <li style={{ marginBottom: '0.5rem' }}>Respond to feedback or support requests you initiate</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            We do <strong>not</strong> use your data for advertising, profiling, or automated decision-making.
          </p>
        </Section>

        <Section title="3. Authentication (Supabase)">
          <p>
            CorpusCalc uses <strong>Supabase</strong> for user authentication. When you create an account
            or log in, your credentials are handled by Supabase's secure infrastructure. We do not store
            raw passwords. Authentication tokens are stored in your browser's local storage to keep you
            signed in across sessions.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            If you sign in via Google OAuth, your email address and name are passed from Google to
            Supabase and stored in our user database. No other Google account data is accessed.
          </p>
        </Section>

        <Section title="4. Data Sharing and Third Parties">
          <p>
            We <strong>do not sell, rent, or trade</strong> your personal information to any third party.
            We share data only with the following service providers who help us operate CorpusCalc:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Supabase:</strong> Database and authentication infrastructure. Data is stored
              on Supabase's servers (AWS-based) and governed by Supabase's Privacy Policy.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Sanity.io:</strong> Content management for articles and educational resources.
              No personal user data is shared with Sanity.
            </li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            We may disclose information if required by law or to protect the rights and safety of
            CorpusCalc users.
          </p>
        </Section>

        <Section title="5. Cookies and Local Storage">
          <p>
            CorpusCalc uses browser <strong>local storage</strong> to persist your authentication
            session (via Supabase) and your planner inputs between visits. We do not use third-party
            advertising cookies.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            You can clear local storage at any time through your browser settings, which will sign
            you out and reset any saved preferences.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you wish to delete
            your account and all associated data, please contact us at the email below. Anonymous
            usage analytics may be retained indefinitely in aggregated form.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We take reasonable steps to protect your data. All data in transit is encrypted via
            HTTPS/TLS. Supabase provides row-level security (RLS) to ensure users can only access
            their own data. However, no system is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            CorpusCalc is intended for adults making retirement planning decisions. We do not knowingly
            collect personal information from individuals under 18 years of age.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Access the personal data we hold about you</li>
            <li style={{ marginBottom: '0.5rem' }}>Request correction of inaccurate data</li>
            <li style={{ marginBottom: '0.5rem' }}>Request deletion of your account and associated data</li>
            <li style={{ marginBottom: '0.5rem' }}>Withdraw consent at any time by deleting your account</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            To exercise any of these rights, contact us at the email address below.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            "Last updated" date at the top. Continued use of CorpusCalc after changes constitutes
            your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            If you have questions or concerns about this Privacy Policy, please reach out to us at:
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
