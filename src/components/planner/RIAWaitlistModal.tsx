import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const C = { darkGreen: '#0f2318', orange: '#e8622a', border: '#e5e1d8', muted: '#6b7280', red: '#dc2626', green: '#16A34A' };

export function RIAWaitlistModal({ riskScore, ytr, onClose, onSuccess }: { riskScore: number; ytr: number; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email required';
    if (!/^[6-9]\d{9}$/.test(mobile)) return 'Valid 10-digit Indian mobile required';
    return null;
  };

  const submit = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr(''); setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('Please log in.'); setBusy(false); return; }
    const { error } = await supabase.from('ria_waitlist').insert({
      user_id: user.id, name: name.trim(), email: email.trim(),
      mobile: mobile.trim(), risk_score: riskScore, ytr,
    });
    if (error?.code === '23505') { onSuccess(); return; }
    if (error) { setErr('Something went wrong. Try again.'); setBusy(false); return; }
    onSuccess();
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.darkGreen, fontFamily: 'system-ui, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4, fontFamily: 'system-ui, sans-serif' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.4)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: '16px 16px 0 0', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.darkGreen }}>SEBI-Registered Advisor Waitlist</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Free review · No commitment</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.muted }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label style={lbl}>FULL NAME *</label><input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="As on PAN card" /></div>
          <div><label style={lbl}>EMAIL *</label><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          <div><label style={lbl}>MOBILE *</label><input style={inp} type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit Indian number" /></div>
        </div>
        {err && <div style={{ marginTop: 12, fontSize: 13, color: C.red }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ marginTop: 20, width: '100%', padding: '13px 20px', background: busy ? C.muted : C.orange, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Joining…' : 'Join Waitlist'}
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.4 }}>
          Your details and plan context are shared with a SEBI-registered advisor for scheduling. One-time submission.
        </div>
      </div>
    </div>
  );
}
