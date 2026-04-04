import { useState, useEffect } from 'react';
import { useScrollAnimation, useCountUp } from '../../hooks/useScrollAnimation';
import { getVisitCount } from '../../lib/supabase';

const stats = [
  { end: 3, suffix: '%', label: 'of Indians have a written retirement plan' },
  { end: 12, suffix: ' yrs', label: 'for inflation to double your expenses at 6%' },
  { end: 3.2, suffix: '×', label: 'more money needed in 20 years at today\'s lifestyle', isFloat: true },
];

const StatItem = ({ stat, index }: { stat: typeof stats[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation(0.3);
  const count = useCountUp(stat.isFloat ? 32 : stat.end, 1800, isVisible);

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 0.5s ease-out ${index * 0.12}s`,
      }}
    >
      <p className="number-hero text-warm-gold mb-2">
        {stat.isFloat ? (count / 10).toFixed(1) : count}{stat.suffix}
      </p>
      <p className="text-sm max-w-[200px] mx-auto" style={{ color: 'hsl(var(--primary-foreground) / 0.6)' }}>
        {stat.label}
      </p>
    </div>
  );
};

const WhyMatters = () => {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const { ref: countRef, isVisible: countVisible } = useScrollAnimation(0.3);
  const animatedCount = useCountUp(visitCount ?? 0, 1500, countVisible && visitCount !== null);

  useEffect(() => {
    getVisitCount().then(setVisitCount);
  }, []);

  return (
    <section id="about" className="py-20 bg-forest">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          {stats.map((s, i) => <StatItem key={i} stat={s} index={i} />)}
        </div>

        {visitCount !== null && visitCount > 0 && (
          <div
            ref={countRef}
            className="text-center mt-14"
            style={{
              opacity: countVisible ? 1 : 0,
              transform: countVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.6s ease-out',
            }}
          >
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', padding: '16px 32px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p className="number-hero text-warm-gold" style={{ fontSize: '42px', margin: 0 }}>
                {animatedCount.toLocaleString('en-IN')}
              </p>
              <p className="text-sm font-body" style={{ color: 'hsl(var(--primary-foreground) / 0.6)', margin: 0 }}>
                plans calculated so far
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: 'hsl(var(--primary-foreground) / 0.25)' }}>
          Source: PFRDA, RBI data
        </p>
      </div>
    </section>
  );
};

export default WhyMatters;
