import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container py-24" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontSize: '72px', fontWeight: 800, color: '#E8E4DE', fontFamily: 'var(--font-body)', margin: '0 0 4px', lineHeight: 1 }}>404</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>Page not found</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 28px', lineHeight: 1.6 }}>
            The page you're looking for doesn't exist, or may have been moved.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
              Go Home
            </Link>
            <Link to="/plan" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '12px', background: '#F8F7F4', color: '#0f2318', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'none', border: '1px solid #E8E4DE' }}>
              Build My Plan
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
