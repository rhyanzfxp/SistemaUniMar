import { Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'rgba(5,13,26,0.9)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Waves size={16} color="white" />
          </div>
          <div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}
            >
              UniMar
            </p>
            <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>
              Educação oceânica gamificada
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>Início</Link>
          <Link to="/games" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>Jogos</Link>
          <Link to="/leaderboard" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem' }}>Ranking</Link>
        </div>

        <p style={{ color: '#334155', fontSize: '0.8rem', margin: 0 }}>
          © 2026 UniMar · Ciberespaço Oceânico · Fortaleza, CE
        </p>
      </div>
    </footer>
  );
}
