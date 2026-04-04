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
