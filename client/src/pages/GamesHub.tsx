import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Clock, Zap, ChevronRight, Loader } from 'lucide-react';
import { gameService } from '../services/api';
import type { Game } from '../models/types';

const difficultyLabels = { fauna: 'Média', flora: 'Fácil-Média', pollution: 'Média-Difícil' };
const categoryColors: Record<string, string> = {
  fauna: '#00D4FF',
  flora: '#10B981',
  pollution: '#F59E0B',
};
const glowClasses: Record<string, string> = {
  fauna: 'glow-cyan',
  flora: 'glow-green',
  pollution: 'glow-amber',
};

export default function GamesHub() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gameService
      .getAll()
      .then(setGames)
      .catch(() => setError('Não foi possível carregar os jogos. Verifique se o servidor está rodando.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '12px', color: '#00D4FF' }}>
        <Loader size={24} style={{ animation: 'spin-slow 1s linear infinite' }} />
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>Carregando jogos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <div style={{ fontSize: '3rem' }}>🌊</div>
        <p style={{ color: '#EF4444', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', textAlign: 'center' }}>{error}</p>
        <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center' }}>
          Execute: <code style={{ color: '#00D4FF' }}>cd server && npm run dev</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(32px, 8vw, 60px) 16px', maxWidth: '1100px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span className="badge-level">Escolha seu Mundo</span>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            margin: '16px 0 12px',
          }}
        >
          Hub de{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Jogos
          </span>
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Escolha um desafio e mergulhe no conhecimento. Explore quizzes temáticos ou teste suas habilidades em nossos minijogos interativos de ação e estratégia.
        </p>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '20px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={22} /> Quizzes de Conhecimento
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >
          {games.map((game) => (
            <Link to={`/games/${game.slug}`} key={game.id} style={{ textDecoration: 'none' }}>
              <div
                className={`glass-card game-card ${glowClasses[game.category]}`}
                style={{ padding: '36px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
              >

                <div
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `${categoryColors[game.category]}10`,
                    border: `1px solid ${categoryColors[game.category]}20`,
                  }}
                />

                <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>
                  {game.icon}
                </div>

                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '99px',
                    background: `${categoryColors[game.category]}20`,
                    border: `1px solid ${categoryColors[game.category]}40`,
                    color: categoryColors[game.category],
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '10px',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {game.category === 'fauna' ? 'Fauna' : game.category === 'flora' ? 'Flora' : 'Poluição'}
                </span>

                <h2
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    color: categoryColors[game.category],
                    margin: '0 0 12px',
                  }}
                >
                  {game.name}
                </h2>

                <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                  {game.description}
                </p>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}>
                    <Gamepad2 size={14} />
                    {game.questionCount} questões
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    {game.timeLimit}s / questão
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}>
                    <Zap size={14} />
                    Dif: {difficultyLabels[game.category]}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: 'auto'
                  }}
                >
                  Iniciar Jogo <ChevronRight size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '20px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gamepad2 size={22} /> Desafios Interativos
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >

          <Link to="/games/ecossistema" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-green"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🌿</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Ecossistema · Drag & Drop</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#10B981', margin: '0 0 12px' }}>Ecossistema do Manguezal</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Arraste as espécies para as zonas corretas do manguezal. Identifique onde cada animal e planta vive neste ecossistema costeiro único.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Gamepad2 size={14} /> 9 espécies</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Drag & Drop</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #00D4FF)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          <Link to="/games/poluicao" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-amber"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🛢️</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Poluição · Simulador</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#F59E0B', margin: '0 0 12px' }}>Simulador de Poluição Visual</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Suas decisões diárias têm impacto direto no oceano. Jogue este simulador interativo e veja a água mudar conforme as suas escolhas ambientais.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Gamepad2 size={14} /> 5 Cenários</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Interativo</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          <Link to="/games/limpeza" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-cyan"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🧹</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Ação · Clicker</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#00D4FF', margin: '0 0 12px' }}>Limpeza Oceânica</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Teste seus reflexos! Remova o lixo que cai na água antes que chegue ao fundo, mas tome cuidado para não assustar os animais marinhos.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Clock size={14} /> Ritmo Acelerado</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Reflexos</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #00D4FF, #3B82F6)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          <Link to="/games/tartaruga" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-green"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🐢</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Runner · Morte Súbita</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#10B981', margin: '0 0 12px' }}>Mergulho da Tartaruga</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Nade para desviar do lixo oceânico e colete águas-vivas para ganhar pontos! Um toque no plástico e é Game Over.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Clock size={14} /> Infinito</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Difícil</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          <Link to="/games/defensor" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-cyan"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🪸</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Estratégia · Tower Defense</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#10B981', margin: '0 0 12px' }}>Defensor dos Corais</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Proteja o recife! Posicione defensores para impedir que o lixo e o peixe-leão destruam os corais.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Clock size={14} /> Infinito</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Média</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>

          <Link to="/games/mangue" style={{ textDecoration: 'none' }}>
            <div
              className="glass-card game-card glow-amber"
              style={{ padding: 'clamp(24px, 5vw, 36px)', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>🦀</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>Labirinto · Puzzle</span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#F59E0B', margin: '0 0 12px' }}>Resgate no Mangue</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                Navegue pelo labirinto de raízes e salve os filhotes perdidos antes que o tempo se esgote!
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Clock size={14} /> 45s</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8rem' }}><Zap size={14} /> Puzzle</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', marginTop: 'auto' }}>
                Jogar Agora <ChevronRight size={16} />
              </button>
            </div>
          </Link>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          marginTop: '48px',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '2rem' }}>💡</div>
        <div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 4px', color: '#E2E8F0' }}>
            Como funciona?
          </p>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Escolha entre <strong>Quizzes de Conhecimento</strong> ou <strong>Desafios Interativos</strong> de ação e estratégia. 
            Acumule pontos salvando o oceano, desviando do lixo ou respondendo corretamente sobre a biodiversidade do Ceará. 
            Ao final, conquiste seu lugar no ranking global! 🏆
          </p>
        </div>
      </div>
    </div>
  );
}
