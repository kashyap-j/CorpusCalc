import { useState, useEffect, useRef } from 'react';
import { parseAmt, fmtInput } from '../../lib/math';

interface AmountInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  hasError?: boolean;
}

export default function AmountInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  id,
  hasError = false,
}: AmountInputProps) {
  const [raw, setRaw] = useState(fmtInput(value));
  const [focused, setFocused] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setRaw(fmtInput(value));
  }, [value]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className={className}>
      <span style={{
        position: 'absolute', left: '14px',
        color: '#6B7280', fontSize: '15px', userSelect: 'none', pointerEvents: 'none',
      }}>₹</span>
      <input
        id={id}
        type="text"
        inputMode="text"
        value={raw}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          paddingLeft: '30px',
          paddingRight: '14px',
          paddingTop: '11px',
          paddingBottom: '11px',
          background: disabled ? '#F5F5F3' : '#FAFAF8',
          border: `1.5px solid ${hasError ? '#DC2626' : focused ? '#e8622a' : '#E8E4DE'}`,
          borderRadius: '12px',
          fontSize: '15px',
          fontFamily: 'var(--font-body)',
          color: '#0f2318',
          outline: 'none',
          boxShadow: focused
            ? (hasError ? '0 0 0 3px rgba(220,38,38,0.1)' : '0 0 0 3px rgba(232,98,42,0.1)')
            : hasError ? '0 0 0 3px rgba(220,38,38,0.08)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
        }}
        onChange={(e) => {
          dirty.current = true;
          setRaw(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          dirty.current = false;
          const n = parseAmt(raw);
          onChange(n);
          setRaw(fmtInput(n));
        }}
      />
    </div>
  );
}
