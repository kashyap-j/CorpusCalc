interface StepHeaderProps {
  step: number;
  totalSteps?: number;
  title: string;
  oneLiner: string;
}

export default function StepHeader({ step, totalSteps = 6, title, oneLiner }: StepHeaderProps) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'inline-block',
        background: '#e8622a',
        color: '#fff',
        borderRadius: '100px',
        padding: '4px 14px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-body)',
        marginBottom: '12px',
      }}>
        STEP {step} OF {totalSteps}
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 700,
        color: '#0f2318',
        margin: '0 0 6px',
        lineHeight: 1.15,
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        fontStyle: 'italic',
        fontFamily: 'var(--font-body)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {oneLiner}
      </p>
    </div>
  );
}
