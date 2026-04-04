import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section id="plan" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-[40px] md:text-[56px] font-bold text-foreground leading-[1.08] mb-5">
            Know your{" "}
            <span className="text-warm-gold-dark">retirement number</span>
          </h1>

          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Answer 6 simple questions. Get a personalised decade-by-decade retirement plan — private, no jargon.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link to="/plan" className="btn-primary-corpus">Find my number →</Link>
            <a href="#how" className="btn-ghost-corpus">See how it works</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
