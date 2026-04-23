import { Link } from 'react-router-dom';
import {
  Waves,
  Gamepad2,
  Trophy,
  Zap,
  Fish,
  Shell,
  Anchor,
  ChevronRight,
} from 'lucide-react';

const stats = [
  { value: '9', label: 'Minijogos', icon: Gamepad2 },
  { value: '30', label: 'Questões', icon: Zap },
  { value: '∞', label: 'Diversão', icon: Fish },
  { value: '#1', label: 'Ranking', icon: Trophy },
];

const features = [
  {
    icon: '🐠',
    title: 'Fauna Marinha',
    description:
      'Quiz cronometrado com espécies reais da costa cearense. Identifique animais, aprenda curiosidades científicas e compita no ranking.',
    color: '#00D4FF',
    glow: 'glow-cyan',
  },
  {
    icon: '🌿',
    title: 'Flora Marinha',
    description:
      'Descubra manguezais, recifes de coral e rodolitos. Perguntas de múltipla escolha com explicações detalhadas de ecossistemas.',
    color: '#10B981',
    glow: 'glow-green',
  },
  {
    icon: '🗑️',
    title: 'Poluição Oceânica',
    description:
      'Entenda o impacto humano nos oceanos de Fortaleza. Dados reais, legislação brasileira e ações que fazem diferença.',
    color: '#F59E0B',
    glow: 'glow-amber',
  },
  {
    icon: '🧩',
    title: 'Ecossistema',
    description:
      'Desafio Drag & Drop interativo. Arraste e solte espécies reais para descobrir onde vivem dentro da zona do manguezal cearense.',
    color: '#7C3AED',
    glow: 'glow-purple',
  },
  {
    icon: '🛢️',
    title: 'Simulador de Poluição',
    description:
      'Suas decisões diárias têm impacto direto no oceano. Jogue este simulador interativo e veja a água mudar conforme as suas escolhas ambientais.',
    color: '#F59E0B',
    glow: 'glow-amber',
  },
  {
    icon: '🧹',
    title: 'Limpeza Oceânica',
    description:
      'Teste seus reflexos! Remova o lixo que cai na água antes que chegue ao fundo, mas tome cuidado para não assustar os animais marinhos.',
    color: '#00D4FF',
    glow: 'glow-cyan',
  },
  {
    icon: '🐢',
    title: 'Mergulho da Tartaruga',
    description:
      'Nade para desviar do lixo oceânico e colete águas-vivas para ganhar pontos! Um toque no plástico e é Game Over.',
    color: '#10B981',
    glow: 'glow-green',
  },
  {
    icon: '🪸',
    title: 'Defensor dos Corais',
    description:
      'Proteja o recife! Posicione defensores para impedir que o lixo e o peixe-leão destruam os corais.',
    color: '#10B981',
    glow: 'glow-cyan',
  },
  {
    icon: '🦀',
    title: 'Resgate no Mangue',
    description:
      'Navegue pelo labirinto de raízes e salve os filhotes perdidos antes que o tempo se esgote!',
    color: '#F59E0B',
    glow: 'glow-amber',
  },
];

const levels = [
  { name: 'Aprendiz do Mar', xp: '0–200 XP', color: '#64748B' },
  { name: 'Explorador Costeiro', xp: '200–500 XP', color: '#10B981' },
  { name: 'Mergulhador', xp: '500–900 XP', color: '#00D4FF' },
  { name: 'Guardião do Oceano', xp: '900+ XP', color: '#7C3AED' },
];

export default function Home() {
  return (
    <div style={{ overflow: 'hidden' }}>

      <section
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '80px 24px',
          position: 'relative',
        }}
      >

        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${8 + (i % 4) * 6}px`,
              height: `${8 + (i % 4) * 6}px`,
              borderRadius: '50%',
              background: `rgba(${i % 3 === 0 ? '0,212,255' : i % 3 === 1 ? '124,58,237' : '16,185,129'}, 0.15)`,
              border: `1px solid rgba(${i % 3 === 0 ? '0,212,255' : i % 3 === 1 ? '124,58,237' : '16,185,129'}, 0.3)`,
              left: `${5 + (i * 8.5) % 90}%`,
              top: `${10 + (i * 7.3) % 80}%`,
              animation: `float-bubble ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${-i * 0.5}s`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '99px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.25)',
            marginBottom: '24px',
            animation: 'slide-up 0.6s ease-out',
          }}
        >
          <Waves size={14} color="#00D4FF" />
          <span
            style={{
              color: '#00D4FF',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
             Oceânico · UniMar
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            lineHeight: 1.05,
            margin: '0 0 24px',
            maxWidth: '900px',
            animation: 'slide-up 0.6s ease-out 0.1s both',
          }}
        >
          Explore o{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Oceano
          </span>
          <br />
          Aprenda Jogando
        </h1>

        <p
          style={{
            color: '#94A3B8',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            maxWidth: '600px',
            lineHeight: 1.7,
            margin: '0 0 40px',
            animation: 'slide-up 0.6s ease-out 0.2s both',
          }}
        >
          Plataforma gamificada de cultura oceânica para universitários.
          Descubra a fauna, flora e desafios ambientais dos mares de Fortaleza.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'slide-up 0.6s ease-out 0.3s both',
          }}
        >
          <Link to="/games">
            <button
              className="btn-primary"
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Gamepad2 size={18} />
              Jogar Agora
              <ChevronRight size={16} />
            </button>
          </Link>
          <Link to="/leaderboard">
            <button
              className="btn-secondary"
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Trophy size={18} />
              Ver Ranking
            </button>
          </Link>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          <svg
            viewBox="0 0 1200 60"
            style={{ display: 'block', width: '100%', height: '60px' }}
          >
            <path
              d="M0,40 C200,10 400,60 600,35 C800,10 1000,55 1200,30 L1200,60 L0,60 Z"
              fill="rgba(0,212,255,0.05)"
            />
          </svg>
        </div>
      </section>

      <section
        style={{
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
          }}
        >
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <Icon size={24} color="#00D4FF" style={{ marginBottom: '8px' }} />
              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 900,
                  fontSize: '2rem',
                  margin: '4px 0',
                  background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </p>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="badge-level">Minijogos</span>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                margin: '16px 0 12px',
              }}
            >
              Nossos Minijogos
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Cada jogo explora uma dimensão diferente do oceano cearense com conteúdo científico real.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((f) => (
              <Link to="/games" key={f.title} style={{ textDecoration: 'none' }}>
                <div
                  className={`glass-card game-card ${f.glow}`}
                  style={{ padding: '32px', height: '100%' }}
                >
                  <div
                    style={{
                      fontSize: '3rem',
                      marginBottom: '16px',
                      lineHeight: 1,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.3rem',
                      color: f.color,
                      marginBottom: '12px',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: '#94A3B8', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                    {f.description}
                  </p>
                  <div
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: f.color,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    Jogar <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '80px 24px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge-level">Gamificação</span>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                margin: '16px 0 12px',
              }}
            >
              Suba de Nível no Oceano
            </h2>
            <p style={{ color: '#64748B' }}>
              Acumule XP respondendo questões e desbloqueie títulos exclusivos.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {levels.map((lvl, i) => (
              <div
                key={lvl.name}
                className="glass-card"
                style={{ padding: '24px', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `${lvl.color}22`,
                    border: `2px solid ${lvl.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    color: lvl.color,
                    fontSize: '1.1rem',
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: lvl.color,
                    margin: '0 0 4px',
                  }}
                >
                  {lvl.name}
                </p>
                <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0 }}>
                  {lvl.xp}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <Shell
            size={48}
            color="#00D4FF"
            style={{ marginBottom: '24px', opacity: 0.8 }}
            className="animate-float"
          />
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              marginBottom: '16px',
            }}
          >
            Pronto para mergulhar?
          </h2>
          <p style={{ color: '#64748B', marginBottom: '40px', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Você sabia que o Ceará abriga mais de 40 espécies de corais endêmicos do Atlântico?
            Vá descobrir (e aprender) tudo sobre eles!
          </p>
          <Link to="/games">
            <button
              className="btn-primary"
              style={{
                padding: '16px 40px',
                borderRadius: '14px',
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Anchor size={20} />
              Começar Agora
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
