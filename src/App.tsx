// build
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const Spinner = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: '#f4f2ee',
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid #e8e4de',
      borderTop: '3px solid #e8622a',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan" element={<PlannerPage />} />
          <Route path="/knowledge" element={<LearnPage />} />
          <Route path="/knowledge/:slug" element={<ArticlePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
