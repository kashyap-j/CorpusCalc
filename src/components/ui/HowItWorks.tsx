import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const steps = [
  { num: "01", title: "Tell us about yourself", desc: "Your age, retirement timeline, and current lifestyle." },
  { num: "02", title: "We calculate your number", desc: "Adjusted for Indian inflation over your lifetime." },
  { num: "03", title: "Get your decade plan", desc: "See how your money grows, decade by decade." },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section id="how" className="py-20 bg-secondary">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Simple. Fast. <span className="text-warm-gold-dark">Private.</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From zero to a complete retirement plan in under 5 minutes.
          </p>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="rounded-2xl bg-card p-6 relative overflow-hidden"
              style={{
                boxShadow: "var(--shadow-card)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.5s ease-out ${i * 0.12}s`,
              }}
            >
              <span
                className="absolute -top-3 -left-2 text-[72px] font-bold font-body leading-none select-none"
                style={{ color: "hsl(var(--forest) / 0.06)" }}
              >
                {s.num}
              </span>
              <div className="relative pt-8">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
