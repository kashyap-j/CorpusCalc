import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Plan", href: "/plan" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "Calculators", href: "/calculators" },
  { label: "About", href: "/about" },
];

const legalLinks = ["Privacy Policy", "Terms", "Disclaimer"];

const Footer = () => (
  <footer className="py-16" style={{ background: "hsl(150, 15%, 28%)" }}>
    <div className="container">
      <div className="grid md:grid-cols-3 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-gold">
              <span className="text-sm font-bold font-body text-foreground">C</span>
            </div>
            <span className="text-base font-bold font-body text-primary-foreground">CorpusCalc</span>
          </div>
          <p className="text-sm mb-3" style={{ color: "hsl(var(--primary-foreground) / 0.5)" }}>
            Retirement planning for India
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--primary-foreground) / 0.3)" }}>
            Not financial advice. Educational planning tool only.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold font-body text-primary-foreground mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2.5">
            {quickLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm font-body transition-colors hover:text-warm-gold"
                style={{ color: "hsl(var(--primary-foreground) / 0.5)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold font-body text-primary-foreground mb-4">Legal</h4>
          <div className="flex flex-col gap-2.5">
            {legalLinks.map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm font-body transition-colors hover:text-warm-gold"
                style={{ color: "hsl(var(--primary-foreground) / 0.5)" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 text-center" style={{ borderTop: "1px solid hsl(var(--primary-foreground) / 0.1)" }}>
        <p className="text-xs font-body" style={{ color: "hsl(var(--primary-foreground) / 0.3)" }}>
          © {new Date().getFullYear()} CorpusCalc
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
