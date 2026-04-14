import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ui/ScrollToTop';

const HomePage       = lazy(() => import('./pages/HomePage'));
const PlannerPage    = lazy(() => import('./pages/PlannerPage'));
const LearnPage      = lazy(() => import('./pages/LearnPage'));
const ArticlePage    = lazy(() => import('./pages/ArticlePage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const GlossaryPage   = lazy(() => import('./pages/GlossaryPage'));
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'));
const AuthCallback   = lazy(() => import('./pages/AuthCallback'));
const AccountPage    = lazy(() => import('./pages/AccountPage'));
const PrivacyPage    = lazy(() => import('./pages/PrivacyPage'));
const TermsPage      = lazy(() => import('./pages/TermsPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const FAQPage        = lazy(() => import('./pages/FAQPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f9f6f1' }} />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan" element={<PlannerPage />} />
          <Route path="/knowledge" element={<LearnPage />} />
          <Route path="/knowledge/:slug" element={<ArticlePage />} />
          <Route path="/calculators" element={<Navigate to="/calculators/sip-calculator" replace />} />
          <Route path="/calculators/sip-calculator" element={<CalculatorsPage />} />
          <Route path="/calculators/inflation-calculator" element={<CalculatorsPage />} />
          <Route path="/calculators/fd-vs-mf-calculator" element={<CalculatorsPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
