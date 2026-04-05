import { Helmet } from 'react-helmet-async';
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/ui/HeroSection";
import HowItWorks from "../components/ui/HowItWorks";
import WhyMatters from "../components/ui/WhyMatters";
import Features from "../components/ui/Features";
import BottomCTA from "../components/ui/BottomCTA";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>CorpusCalc – Retirement Planner for India</title>
        <meta name="description" content="Plan your retirement corpus with SIP calculators, inflation tools, and expert guides tailored for India." />
        <link rel="canonical" href="https://corpuscalc.com/" />
      </Helmet>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyMatters />
      <Features />
      <BottomCTA />
      <Footer />
    </div>
  );
}
