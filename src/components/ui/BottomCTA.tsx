import { Link } from "react-router-dom";

const BottomCTA = () => (
  <section id="articles" className="py-20 bg-forest">
    <div className="container text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
        Your retirement plan starts with one question
      </h2>
      <p className="text-lg mb-8" style={{ color: "hsl(var(--primary-foreground) / 0.65)" }}>
        How much will you need?
      </p>
      <Link
        to="/plan"
        className="inline-flex items-center justify-center rounded-full font-semibold bg-warm-gold text-foreground px-8 py-4 text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{ minHeight: 48 }}
      >
        Get Started →
      </Link>
    </div>
  </section>
);

export default BottomCTA;
