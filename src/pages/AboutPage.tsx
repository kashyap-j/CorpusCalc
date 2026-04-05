import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';

const FEEDBACK_RL_KEY = 'feedback_timestamps';
const FEEDBACK_RL_MAX = 3;
const FEEDBACK_RL_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function getRecentSubmissions(): number[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_RL_KEY);
    const all: number[] = raw ? JSON.parse(raw) : [];
    return all.filter(t => t > Date.now() - FEEDBACK_RL_WINDOW);
  } catch {
    return [];
  }
}

function recordSubmission(existing: number[]): void {
  try {
    localStorage.setItem(FEEDBACK_RL_KEY, JSON.stringify([...existing, Date.now()]));
  } catch {}
}

function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submissions, setSubmissions] = useState<number[]>(() => getRecentSubmissions());

  const rateLimited = submissions.length >= FEEDBACK_RL_MAX;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || rateLimited) return;
    setStatus('sending');
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{ name: name.trim() || null, email: email.trim() || null, message: msg.trim() }]);
      if (error) throw error;
      const updated = [...submissions, Date.now()];
      recordSubmission(submissions);
      setSubmissions(updated);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '12px',
    border: '1.5px solid #E8E4DE', background: '#fff',
    fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
    color: '#9CA3AF', fontFamily: 'var(--font-body)', display: 'block', marginBottom: '5px',
  };

  if (rateLimited) {
    return (
      <p style={{ fontSize: '13px', color: '#92400E', fontFamily: 'var(--font-body)', margin: 0 }}>
        You've submitted 3 times in the last hour. Please try again later.
      </p>
    );
  }

  if (status === 'sent') {
    return (
      <div style={{ borderRadius: '14px', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '24px', margin: '0 0 8px' }}>✓</p>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>Thanks for the feedback!</p>
        <p style={{ fontSize: '13px', color: '#166534', fontFamily: 'var(--font-body)', margin: 0 }}>I read every message personally and respond where I can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label htmlFor="feedback-name" style={lbl}>Name (optional)</label>
          <input id="feedback-name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inp} />
        </div>
        <div>
          <label htmlFor="feedback-email" style={lbl}>Email (optional)</label>
          <input id="feedback-email" type="email" placeholder="For a reply" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        </div>
      </div>
      <div>
        <label htmlFor="feedback-message" style={lbl}>Message *</label>
        <textarea
          id="feedback-message"
          placeholder="Bug report, feature request, general feedback..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          required
          rows={4}
          style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>
      <div aria-live="polite" aria-atomic="true">
        {status === 'error' && (
          <p role="alert" style={{ fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-body)', margin: 0 }}>
            Something went wrong. Please try again or email directly.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || !msg.trim() || rateLimited}
        style={{
          padding: '12px 24px', borderRadius: '12px', border: 'none',
          background: status === 'sending' || !msg.trim() || rateLimited ? '#9CA3AF' : '#0f2318',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          fontFamily: 'var(--font-body)', cursor: status === 'sending' || !msg.trim() || rateLimited ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {status === 'sending' ? 'Sending...' : 'Send Feedback'}
      </button>
    </form>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>About CorpusCalc – India's Retirement Planning Tool</title>
        <meta name="description" content="Learn about CorpusCalc, built to help Indians plan smarter retirements with clear tools and honest guides." />
        <link rel="canonical" href="https://corpuscalc.com/about" />
      </Helmet>
      <Navbar />
      <div className="container py-12">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Hero */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#e8622a', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>About</p>
            <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.2 }}>
              Retirement planning that's honest about India
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.75 }}>
              CorpusCalc was built out of frustration. Most retirement calculators assume Western markets, ignore inflation seriously, and skip the hard stuff — phased drawdown, kids goals, spouse timelines.
            </p>
          </div>

          {/* Story */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
            {[
              {
                title: 'Why I built this',
                body: 'I was trying to figure out my own retirement number and found every calculator either too simple ("save 10x your salary") or too complex for regular people. I wanted something that felt like a conversation — one that walked you through the logic, showed the math, and actually helped you make a decision.',
              },
              {
                title: 'What makes it different',
                body: 'CorpusCalc simulates retirement in phases because life isn\'t linear. Your 60s look different from your 80s. It accounts for the corpus depletion problem — when interest income doesn\'t cover inflation-adjusted expenses — and shows you exactly when your money runs out if you don\'t plan well.',
              },
              {
                title: 'Who it\'s for',
                body: 'Indian working professionals who want to think seriously about retirement but aren\'t finance experts. You don\'t need to know what SWR means before you start. The planner teaches you the concepts as you go.',
              },
            ].map(s => (
              <div key={s.title} style={{ borderRadius: '14px', background: '#fff', border: '1px solid #E8E4DE', padding: '20px 22px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>{s.title}</h2>
                <p style={{ fontSize: '14px', color: '#374151', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '48px' }}>
            {[
              { n: 'Free', sub: 'No subscription ever' },
              { n: '6 steps', sub: 'Full retirement plan' },
              { n: '100%', sub: 'India-specific math' },
            ].map(s => (
              <div key={s.n} style={{ borderRadius: '14px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{s.n}</p>
                <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ borderRadius: '14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderLeft: '4px solid #F59E0B', padding: '18px 20px', marginBottom: '48px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>Disclaimer</h3>
            <p style={{ fontSize: '13px', color: '#78350F', fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.7 }}>
              CorpusCalc is an <strong>educational planning tool</strong>, not a registered investment advisor. The projections and numbers shown are illustrations based on the inputs you provide and assumed returns.
            </p>
            <p style={{ fontSize: '13px', color: '#78350F', fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.7 }}>
              Actual returns will vary. Markets can — and do — deliver very different outcomes from historical averages. Tax laws change. Life circumstances change.
            </p>
            <p style={{ fontSize: '13px', color: '#78350F', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.7 }}>
              Always consult a SEBI-registered financial advisor before making investment decisions. This tool is meant to help you think and ask better questions — not to replace professional advice.
            </p>
          </div>

          {/* Privacy */}
          <div style={{ borderRadius: '14px', background: '#EFF6FF', border: '1px solid #93C5FD', padding: '18px 20px', marginBottom: '48px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1D4ED8', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>Privacy</h3>
            <p style={{ fontSize: '13px', color: '#1E40AF', fontFamily: 'var(--font-body)', margin: '0 0 8px', lineHeight: 1.7 }}>
              Your plan is stored locally in your browser. If you create an account, your data is saved to a secure Supabase database so you can access it from any device.
            </p>
            <p style={{ fontSize: '13px', color: '#1E40AF', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.7 }}>
              We don't sell your data. We don't track you with third-party cookies. Google sign-in is offered for convenience only.
            </p>
          </div>

          {/* Feedback */}
          <div style={{ borderRadius: '16px', background: '#fff', border: '1px solid #E8E4DE', padding: '24px', marginBottom: '40px', boxShadow: '0 2px 16px rgba(15,35,24,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>Send feedback</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Found a bug? Have a feature idea? Just want to say something? I'm one person building this and I read everything.
            </p>
            <FeedbackForm />
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
