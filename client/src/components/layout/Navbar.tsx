import { Link, useLocation } from 'react-router-dom';
import { Waves, Trophy, Gamepad2, Home, Menu, X, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useSound } from '../../context/SoundContext';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/learn', label: 'Estudar', icon: BookOpen },
  { path: '/games', label: 'Jogos', icon: Gamepad2 },
  { path: '/leaderboard', label: 'Ranking', icon: Trophy },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { muted, toggleMute } = useSound();

  return (
    <nav
      style={{
        background: 'rgba(5,13,26,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >

        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,212,255,0.4)',
            }}
          >
            <Waves size={20} color="white" />
          </div>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.3rem',
              background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            UniMar
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="hidden-mobile">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: active ? '#00D4FF' : '#94A3B8',
                  background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          <button
            id="navbar-mute-btn"
            onClick={toggleMute}
            title={muted ? 'Ativar sons' : 'Silenciar sons'}
            style={{
              background: muted ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.08)',
              border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.2)'}`,
              borderRadius: '10px',
              padding: '8px 10px',
              cursor: 'pointer',
              color: muted ? '#EF4444' : '#00D4FF',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
              marginLeft: '4px',
            }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <button
            onClick={toggleMute}
            title={muted ? 'Ativar sons' : 'Silenciar sons'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: muted ? '#EF4444' : '#94A3B8',
              display: 'none',
              padding: '6px',
            }}
            className="mobile-toggle"
            aria-label={muted ? 'Ativar sons' : 'Silenciar'}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'none',
              padding: '6px',
            }}
            className="mobile-toggle"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  color: active ? '#00D4FF' : '#94A3B8',
                  background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
