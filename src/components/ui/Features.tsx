import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const features = [
  { title: "SIP Planning", desc: "How much to invest monthly" },
  { title: "Retirement Corpus", desc: "The exact number you need" },
  { title: "Kids Goals", desc: "Education and wedding planning" },
  { title: "Decade Simulation", desc: "Year by year projection" },
  { title: "Debt vs Equity", desc: "How to split your money" },
  { title: "Inflation Adjusted", desc: "Real numbers, not guesses" },
];

const Features = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section id="calculators" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Everything in <span className="text-forest-light">one plan</span>
          </h2>
          <p className="text-muted-foreground">A complete picture of your financial future.</p>
        </div>
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl bg-card p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                boxShadow: "var(--shadow-card)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.5s ease-out ${i * 0.07}s`,
              }}
            >
              <h3 className="text-[15px] font-bold text-foreground font-body mb-1">{f.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
