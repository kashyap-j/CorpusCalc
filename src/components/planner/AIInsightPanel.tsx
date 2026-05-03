import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { usePlannerStore } from '../../store/plannerStore';
import { compute } from '../../lib/math';
import { computeRiskScore, buildInsightsPrompt, hashPlannerState, type RiskScoreResult } from '../../lib/riskScore';
import { RIAWaitlistModal } from './RIAWaitlistModal';

const C = {
  darkGreen: '#0f2318', orange: '#e8622a', yellow: '#F4C430',
  green: '#16A34A', red: '#dc2626', blue: '#0ea5e9', purple: '#7c3aed',
  bg: '#fafaf8', border: '#e5e1d8', muted: '#6b7280',
};

type PanelState = 'idle' | 'loading' | 'streaming' | 'done' | 'error' | 'rate_limited';

function fmt(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  return n.toLocaleString('en-IN');
}

function buildCoreRows(r: RiskScoreResult, sipAmt: number) {
  const sip = sipAmt * r.coreRatio;
  if (r.score <= 55) return [
    { name: 'Nifty 50 Index Fund', amt: Math.round(sip * 0.35), pct: Math.round(r.coreRatio * 100 * 0.35), note: '' },
    { name: 'Flexi Cap Fund', amt: Math.round(sip * 0.30), pct: Math.round(r.coreRatio * 100 * 0.30), note: '' },
    { name: 'Aggressive Hybrid Fund', amt: Math.round(sip * 0.35), pct: Math.round(r.coreRatio * 100 * 0.35), note: '' },
  ];
  const ppf = r.ytr > 10 ? 0.15 : 0;
  const rows = [
    { name: 'Nifty 50 Index Fund', amt: Math.round(sip * (1 - ppf) * 0.45), pct: Math.round(r.coreRatio * 100 * (1 - ppf) * 0.45), note: '' },
    { name: 'Flexi Cap Fund', amt: Math.round(sip * (1 - ppf) * 0.55), pct: Math.round(r.coreRatio * 100 * (1 - ppf) * 0.55), note: '' },
  ];
  if (r.ytr > 10) rows.push({ name: 'PPF / VPF', amt: Math.round(sip * ppf), pct: Math.round(r.coreRatio * 100 * ppf), note: '(old tax regime only)' });
  return rows;
}

function buildSatRows(r: RiskScoreResult, sipAmt: number) {
  if (r.ytr <= 10 || r.satelliteRatio === 0) return [];
  const sip = sipAmt * r.satelliteRatio;
  const rows = [
    { name: 'Mid Cap Fund', amt: Math.round(sip * 0.40), pct: Math.round(r.satelliteRatio * 100 * 0.40), note: '' },
    { name: 'International / US Fund', amt: Math.round(sip * 0.30), pct: Math.round(r.satelliteRatio * 100 * 0.30), note: '' },
  ];
  if (r.ytr > 15) rows.push({ name: 'Small Cap Fund', amt: Math.round(sip * 0.20), pct: Math.round(r.satelliteRatio * 100 * 0.20), note: '← YTR > 15 only' });
  if (r.score > 75) rows.push({ name: 'Sectoral / Thematic', amt: Math.round(sip * 0.10), pct: Math.round(r.satelliteRatio * 100 * 0.10), note: 'High volatility' });
  return rows;
}

function parseSections(text: string) {
  const get = (n: number) => {
    const m = text.match(new RegExp(`## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=## \\d\\.|$)`));
    return m ? m[1].trim() : '';
  };
  return { verdict: get(1), core: get(2), satellite: get(3), debt: get(4), kids: get(5), blindspots: get(6) };
}

export function AIInsightPanel({ onClose }: { onClose: () => void }) {
  const { state } = usePlannerStore();
  const computed = compute(state);
  const corpus = computed.totalCorpus;
  const reqCorpus = computed.reqCorpus;
  const rr = computeRiskScore(state, corpus, reqCorpus);
  const planHash = hashPlannerState(state);
  const sipAmt = state.sipAmt;

  const [ps, setPs] = useState<PanelState>('idle');
  const [text, setText] = useState('');
  const [remaining, setRemaining] = useState<number>(5);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const [showRIA, setShowRIA] = useState(false);
  const [riaSubmitted, setRiaSubmitted] = useState(false);
  const [openAcc, setOpenAcc] = useState<Record<string, boolean>>({});
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ria } = await supabase.from('ria_waitlist').select('id').eq('user_id', user.id).maybeSingle();
      if (ria) setRiaSubmitted(true);
      const win = new Date(Date.now() - 86400000).toISOString();
      const { data: usage } = await supabase
        .from('ai_insights_usage')
        .select('id, used_at')
        .eq('user_id', user.id)
        .gte('used_at', win)
        .order('used_at', { ascending: true });
      if (usage) {
        setRemaining(Math.max(0, 5 - usage.length));
        if (usage.length >= 5) {
          setResetAt(new Date(new Date(usage[0].used_at).getTime() + 86400000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    })();
    return () => abort.current?.abort();
  }, []);

  const fetchInsights = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErrMsg('Please log in.'); setPs('error'); return; }
    setPs('loading'); setText(''); setErrMsg('');
    abort.current = new AbortController();
    const prompt = buildInsightsPrompt(state, rr, corpus, reqCorpus);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ planHash, prompt }),
          signal: abort.current.signal,
        }
      );

      if (resp.status === 429) {
        const d = await resp.json();
        setResetAt(d.reset_at ? new Date(d.reset_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null);
        setRemaining(0); setPs('rate_limited'); return;
      }
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}));
        setErrMsg(d.error ?? 'Service unavailable.'); setPs('error'); return;
      }
      if ((resp.headers.get('Content-Type') ?? '').includes('application/json')) {
        const d = await resp.json();
        if (d.cached) { setText(d.response); setRemaining(d.remaining ?? null); setPs('done'); return; }
      }

      setPs('streaming');
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === 'content_block_delta' && evt.delta?.text) setText(p => p + evt.delta.text);
            if (evt.type === 'meta' && typeof evt.remaining === 'number') setRemaining(evt.remaining);
            if (evt.type === 'error') {
              setErrMsg(evt.error === 'stream_timeout' ? 'Response timed out. Try again.' : 'Stream error.');
              setPs('error'); return;
            }
          } catch { /**/ }
        }
      }
      setPs('done');
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setErrMsg('Connection failed. Try again.'); setPs('error');
    }
  }, [state, rr, corpus, reqCorpus, planHash]);

  const sections = parseSections(text);
  const accords = [
    { key: 'debt', emoji: '🟡', title: 'Debt Instruments', body: sections.debt },
    { key: 'blind', emoji: '🔴', title: 'Blind Spots', body: sections.blindspots },
    { key: 'kids', emoji: '🟠', title: 'Kids Goals', body: sections.kids },
    { key: 'disc', emoji: '⚪', title: "What This Doesn't Account For", body: 'This report is for informational purposes only and does not constitute SEBI-registered investment advice. Tax implications vary by regime. Consult a qualified financial advisor before investing.' },
  ].filter(a => a.body);

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '5px 0', borderBottom: `1px dotted ${C.border}`,
    fontFamily: 'system-ui, sans-serif', fontSize: 13, color: C.darkGreen,
  };

  return (
    <>
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(420px, 100vw)', background: C.bg, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', fontFamily: "'Georgia', serif", zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: C.orange, textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>CorpusCalc Insights</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: 'system-ui, sans-serif', marginTop: 2 }}>
              {remaining} of 5 insights remaining today{remaining === 0 && resetAt ? ` · Resets at ${resetAt}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.muted, lineHeight: 1 }}>×</button>
        </div>

        {/* Scroll body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ZONE 1 — always instant, no API needed */}
          <div style={{ paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui, sans-serif', marginBottom: 4 }}>
              {state.name || 'Your plan'} · {state.age > 0 ? state.age : '—'} yrs · {rr.ytr} years to retirement
            </div>
            <div style={{ fontSize: 13, fontFamily: 'system-ui, sans-serif', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: C.darkGreen }}>Risk Profile: {rr.label}</span>
              {'  '}
              <span style={{ letterSpacing: 1, color: rr.score > 55 ? C.orange : C.green }}>
                {'█'.repeat(Math.round(rr.score / 10))}{'░'.repeat(10 - Math.round(rr.score / 10))}
              </span>
              {'  '}
              <span style={{ color: C.muted }}>{rr.score}/100</span>
            </div>
            <div style={{ fontSize: 15, fontStyle: 'italic', color: C.darkGreen, lineHeight: 1.5, borderLeft: `3px solid ${C.orange}`, paddingLeft: 12 }}>
              {reqCorpus - corpus > 0
                ? `${rr.ytr > 15 ? 'Time is on your side' : 'Your window is narrowing'} — ₹${fmt(reqCorpus - corpus)} gap needs ${rr.ytr > 15 ? 'steady equity growth' : 'focused action now'}.`
                : `You're on track${rr.ytr > 15 ? ' — use this runway to compound wealth aggressively' : '. Protect gains as retirement nears'}.`}
            </div>
          </div>

          {/* ZONE 2 — allocation blueprint, shown once streaming starts */}
          {(ps === 'streaming' || ps === 'done') && (
            <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif', marginBottom: 12 }}>
                YOUR MONTHLY ₹{fmt(sipAmt)} SIP
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.darkGreen, fontFamily: 'system-ui, sans-serif' }}>CORE PORTFOLIO</span>
                  <span style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui, sans-serif' }}>{Math.round(rr.coreRatio * 100)}% · ₹{fmt(Math.round(sipAmt * rr.coreRatio))}/mo</span>
                </div>
                <div style={{ fontSize: 13, letterSpacing: 1, color: C.green, marginBottom: 6 }}>
                  {'█'.repeat(Math.round(rr.coreRatio * 20))}{'░'.repeat(20 - Math.round(rr.coreRatio * 20))}
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>Stable. Lower volatility.</span>
                </div>
                {buildCoreRows(rr, sipAmt).map(row => (
                  <div key={row.name} style={rowStyle}>
                    <span>{row.name}{row.note ? <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{row.note}</span> : null}</span>
                    <span style={{ display: 'flex', gap: 16 }}>
                      <span style={{ color: C.green }}>₹{fmt(row.amt)}</span>
                      <span style={{ color: C.muted, minWidth: 32, textAlign: 'right' }}>{row.pct}%</span>
                    </span>
                  </div>
                ))}
              </div>
              {rr.ytr > 10 && rr.satelliteRatio > 0 ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: 'system-ui, sans-serif' }}>SATELLITE PORTFOLIO</span>
                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'system-ui, sans-serif' }}>{Math.round(rr.satelliteRatio * 100)}% · ₹{fmt(Math.round(sipAmt * rr.satelliteRatio))}/mo</span>
                  </div>
                  <div style={{ fontSize: 13, letterSpacing: 1, color: C.blue, marginBottom: 6 }}>
                    {'█'.repeat(Math.round(rr.satelliteRatio * 20))}{'░'.repeat(20 - Math.round(rr.satelliteRatio * 20))}
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>High growth. {rr.ytr}+ yr horizon.</span>
                  </div>
                  {buildSatRows(rr, sipAmt).map(row => (
                    <div key={row.name} style={rowStyle}>
                      <span>{row.name}{row.note ? <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{row.note}</span> : null}</span>
                      <span style={{ display: 'flex', gap: 16 }}>
                        <span style={{ color: C.blue }}>₹{fmt(row.amt)}</span>
                        <span style={{ color: C.muted, minWidth: 32, textAlign: 'right' }}>{row.pct}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 6, border: `1px solid ${C.orange}`, fontSize: 12, color: C.orange, fontFamily: 'system-ui, sans-serif' }}>
                  Satellite omitted — {rr.ytr} years to retirement prioritises capital preservation.
                </div>
              )}
            </div>
          )}

          {/* Loading pulse */}
          {ps === 'loading' && (
            <div style={{ paddingTop: 24 }}>
              <style>{`@keyframes cc-pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
              {[80, 55, 55, 40, 55, 50].map((w, i) => (
                <div key={i} style={{ height: 14, width: `${w}%`, background: '#e5e7eb', borderRadius: 4, marginBottom: 10, animation: `cc-pulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
              ))}
            </div>
          )}

          {/* ZONE 3 — accordions */}
          {(ps === 'streaming' || ps === 'done') && accords.length > 0 && (
            <div style={{ paddingTop: 20 }}>
              {accords.map(({ key, emoji, title, body }) => (
                <div key={key} style={{ marginBottom: 8, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenAcc(o => ({ ...o, [key]: !o[key] }))}
                    style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', background: openAcc[key] ? '#f9fafb' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: C.darkGreen, textAlign: 'left' }}
                  >
                    <span>{emoji} {title}</span>
                    <span style={{ color: C.muted }}>{openAcc[key] ? '▲' : '▼'}</span>
                  </button>
                  {openAcc[key] && (
                    <div style={{ padding: '12px 16px', background: C.bg, fontSize: 13, lineHeight: 1.7, color: C.darkGreen, fontFamily: 'system-ui, sans-serif', whiteSpace: 'pre-wrap' }}>
                      {body}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA button */}
          {ps === 'idle' && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={fetchInsights}
                disabled={remaining === 0}
                style={{ width: '100%', padding: '14px 20px', background: remaining === 0 ? '#e5e1d8' : C.orange, color: remaining === 0 ? C.muted : '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: remaining === 0 ? 'not-allowed' : 'pointer', fontFamily: 'system-ui, sans-serif' }}
              >
                {remaining === 0 ? `Daily limit reached · Resets at ${resetAt}` : 'Generate My Investment Roadmap'}
              </button>
              {remaining !== null && remaining > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: C.muted, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
                  Uses 1 of your {remaining} remaining insights today
                </div>
              )}
            </div>
          )}

          {ps === 'error' && (
            <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', borderRadius: 8, border: `1px solid ${C.red}` }}>
              <div style={{ fontSize: 13, color: C.red, fontFamily: 'system-ui, sans-serif' }}>{errMsg}</div>
              <button onClick={fetchInsights} style={{ marginTop: 12, padding: '8px 16px', background: C.darkGreen, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>Try again</button>
            </div>
          )}

          {ps === 'rate_limited' && (
            <div style={{ marginTop: 24, padding: 16, background: '#fffbeb', borderRadius: 8, border: `1px solid ${C.yellow}` }}>
              <div style={{ fontWeight: 600, color: C.darkGreen, fontFamily: 'system-ui, sans-serif', marginBottom: 4 }}>Daily limit reached</div>
              <div style={{ fontSize: 13, color: C.muted, fontFamily: 'system-ui, sans-serif' }}>5 insights used. {resetAt ? `Resets at ${resetAt}.` : ''}</div>
            </div>
          )}
        </div>

        {/* RIA footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, background: '#fff', flexShrink: 0 }}>
          {riaSubmitted
            ? <div style={{ fontSize: 13, color: C.green, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>✓ You're on the list. We'll be in touch.</div>
            : (
              <button onClick={() => setShowRIA(true)} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, color: C.darkGreen, fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>
                Want a SEBI-registered advisor to review your plan? <span style={{ color: C.orange }}>Join the waitlist →</span>
              </button>
            )
          }
        </div>
      </div>

      {showRIA && (
        <RIAWaitlistModal
          riskScore={rr.score}
          ytr={rr.ytr}
          onClose={() => setShowRIA(false)}
          onSuccess={() => { setRiaSubmitted(true); setShowRIA(false); }}
        />
      )}
    </>
  );
}
