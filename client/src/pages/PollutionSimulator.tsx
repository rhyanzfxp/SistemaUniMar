import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Droplet, Skull } from 'lucide-react';
import { useSound } from '../context/SoundContext';

interface Decision {
  id: number;
  scenario: string;
  options: {
    text: string;
    isEcoFriendly: boolean;
    consequenceText: string;
    pollutionImpact: number; 
  }[];
}

const DECISIONS: Decision[] = [
  {
    id: 1,
    scenario: 'Você foi ao supermercado fazer compras para a semana.',
    options: [
      { text: 'Levo minha própria ecobag', isEcoFriendly: true, consequenceText: 'Menos plástico no mundo!', pollutionImpact: 0 },
      { text: 'Uso sacolas plásticas do mercado', isEcoFriendly: false, consequenceText: 'Muitas dessas sacolas vão parar no oceano.', pollutionImpact: 20 },
    ],
  },
  {
    id: 2,
    scenario: 'Sua garrafa de água acabou durante o passeio na praia.',
    options: [
      { text: 'Compro outra garrafa plástica', isEcoFriendly: false, consequenceText: 'Microplásticos são engolidos por peixes.', pollutionImpact: 20 },
      { text: 'Uso minha garrafa reutilizável no bebedouro', isEcoFriendly: true, consequenceText: 'Zero lixo gerado, ótima escolha!', pollutionImpact: 0 },
    ],
  },
  {
    id: 3,
    scenario: 'Sobrou óleo de fritura do almoço. O que você faz?',
    options: [
      { text: 'Guardo em uma garrafa para reciclagem', isEcoFriendly: true, consequenceText: 'Você evitou a contaminação de milhares de litros de água.', pollutionImpact: 0 },
      { text: 'Jogo direto na pia', isEcoFriendly: false, consequenceText: 'O óleo contamina rios e chega ao mar, sufocando a vida marinha.', pollutionImpact: 30 },
    ],
  },
  {
    id: 4,
    scenario: 'Fim de tarde na praia, hora de ir embora e você tem lixo do lanche.',
    options: [
      { text: 'Deixo na areia, a maré leva', isEcoFriendly: false, consequenceText: 'Tartarugas confundem lixo com comida e morrem.', pollutionImpact: 20 },
      { text: 'Levo comigo até achar uma lixeira', isEcoFriendly: true, consequenceText: 'A praia continua limpa para todos.', pollutionImpact: 0 },
    ],
  },
  {
    id: 5,
    scenario: 'Na hora de comprar produtos de limpeza:',
    options: [
      { text: 'Busco produtos biodegradáveis', isEcoFriendly: true, consequenceText: 'Menos produtos químicos tóxicos no esgoto.', pollutionImpact: 0 },
      { text: 'Compro os tradicionais, mais baratos', isEcoFriendly: false, consequenceText: 'Químicos fortes causam eutrofização da água (morte por algas).', pollutionImpact: 10 },
    ],
  },
];

export default function PollutionSimulator() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [currentStep, setCurrentStep] = useState(0);
  const [pollutionLevel, setPollutionLevel] = useState(0); 
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isGood: boolean } | null>(null);

  const totalPointsAvailable = DECISIONS.length * 20;

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
        if (currentStep < DECISIONS.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setTimeout(() => {
            playFanfare();
            setFinished(true);
          }, 500);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [feedback, currentStep, playFanfare]);

  const handleOptionSelect = (option: typeof DECISIONS[0]['options'][0]) => {
    if (feedback) return; 

    setFeedback({ text: option.consequenceText, isGood: option.isEcoFriendly });

    if (option.isEcoFriendly) {
      playCorrect();
      setScore(prev => prev + 20); 
    } else {
      playWrong();
      setPollutionLevel(prev => Math.min(100, prev + option.pollutionImpact));
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setPollutionLevel(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
  };

  const getOceanBackground = () => {
    const ratio = pollutionLevel / 100;
    const r = Math.round(0 + (43 - 0) * ratio); 
    const g = Math.round(212 + (58 - 212) * ratio);
    const b = Math.round(255 + (47 - 255) * ratio);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const currentDecision = DECISIONS[currentStep];
  const percentageScore = Math.round((score / totalPointsAvailable) * 100);

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 80px)',
      overflow: 'hidden',
      transition: 'background-color 1.5s ease-in-out',
      backgroundColor: getOceanBackground(),
    }}>
      
      {/* Elementos flutuantes de fundo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ opacity: 1 - (pollutionLevel / 100), transition: 'opacity 1.5s' }}>
          <div className="float-anim" style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '3rem', animationDelay: '0s' }}>🐠</div>
          <div className="float-anim" style={{ position: 'absolute', top: '50%', right: '15%', fontSize: '4rem', animationDelay: '1s', animationDirection: 'reverse' }}>🐢</div>
          <div className="float-anim" style={{ position: 'absolute', bottom: '15%', left: '30%', fontSize: '2.5rem', animationDelay: '2s' }}>🐡</div>
          <div style={{ position: 'absolute', bottom: '0', right: '10%', fontSize: '5rem', filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.5))' }}>🪸</div>
        </div>

        <div style={{ opacity: pollutionLevel / 100, transition: 'opacity 1.5s' }}>
          <div className="float-anim" style={{ position: 'absolute', top: '15%', right: '20%', fontSize: '3rem', animationDelay: '0.5s' }}>🥤</div>
          <div className="float-anim" style={{ position: 'absolute', top: '40%', left: '25%', fontSize: '3.5rem', animationDelay: '1.5s', animationDirection: 'reverse' }}>🗑️</div>
          <div className="float-anim" style={{ position: 'absolute', bottom: '30%', right: '35%', fontSize: '4rem', animationDelay: '0.2s' }}>🛢️</div>
          <div className="float-anim" style={{ position: 'absolute', bottom: '10%', left: '15%', fontSize: '2.5rem', animationDelay: '1s' }}>🥫</div>
        </div>
        
        {/* Camada de Turvação (Overlays) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(50,50,50,0) 0%, rgba(30,40,30,0.7) 100%)',
          opacity: pollutionLevel / 100,
          transition: 'opacity 1.5s'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px, 5vw, 40px) 16px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
          <Link to="/games">
            <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ArrowLeft size={14} /> Sair
            </button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{pollutionLevel < 50 ? '🌊' : '🛢️'}</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#FFF', fontSize: 'clamp(0.85rem, 3vw, 1rem)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Simulador de Poluição</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{score} pts</span>
            <button onClick={handleReset} title="Reiniciar" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#FFF', display: 'flex', alignItems: 'center' }}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Indicador de Poluição Superior */}
        <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px 16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplet size={14} color="#00D4FF"/> Oceano Limpo</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Nível de Poluição: {pollutionLevel}% <Skull size={14} color={pollutionLevel > 50 ? '#EF4444' : '#94A3B8'}/></span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${pollutionLevel}%`, 
              background: pollutionLevel < 30 ? '#10B981' : pollutionLevel < 70 ? '#F59E0B' : '#EF4444',
              transition: 'all 1s ease-out'
            }} />
          </div>
        </div>

        {!finished ? (
          <div className="glass-card" style={{ padding: 'clamp(24px, 5vw, 40px)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(15,23,42,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
              <span>Situação {currentStep + 1} de {DECISIONS.length}</span>
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: '#FFF', margin: '0 0 32px', lineHeight: 1.3 }}>
              {currentDecision.scenario}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentDecision.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={feedback !== null}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '20px',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '1.05rem',
                    textAlign: 'left',
                    cursor: feedback ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: feedback ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  className={feedback ? '' : 'hover-glow-effect'}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {idx === 0 ? 'A' : 'B'}
                  </div>
                  {opt.text}
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background: feedback.isGood ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                border: `1px solid ${feedback.isGood ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                animation: 'slide-up 0.3s ease-out'
              }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, margin: '0 0 8px', fontSize: '1.1rem', color: feedback.isGood ? '#10B981' : '#EF4444' }}>
                  {feedback.isGood ? 'Ótima Escolha! 🌿' : 'Escolha Prejudicial! ⚠️'}
                </p>
                <p style={{ margin: 0, color: '#E2E8F0', fontSize: '0.95rem' }}>{feedback.text}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 'clamp(32px, 5vw, 48px)', textAlign: 'center', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'scale-in 0.5s ease-out' }}>
              {pollutionLevel < 30 ? '🌊' : pollutionLevel < 70 ? '🐢' : '🛢️'}
            </div>
            
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: '#FFF', margin: '0 0 16px' }}>
              {pollutionLevel === 0 ? 'Protetor dos Oceanos!' : pollutionLevel < 50 ? 'Cidadão Consciente' : 'Alerta Ambiental!'}
            </h1>
            
            <p style={{ color: '#CBD5E1', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
              {pollutionLevel === 0 
                ? 'Suas escolhas mantiveram o mar limpo e seguro para a vida marinha. Excelente trabalho!' 
                : pollutionLevel < 50 
                ? 'Você fez boas escolhas, mas ainda há espaço para melhorar. O oceano agradece seu esforço!' 
                : 'Suas ações causaram um impacto negativo severo no oceano. É hora de repensar nossos hábitos diários!'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#10B981', margin: 0 }}>{score}</p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Pontos Ganhos</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', color: pollutionLevel > 50 ? '#EF4444' : '#F59E0B', margin: 0 }}>{pollutionLevel}%</p>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Nível de Poluição</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleReset} style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} /> Tentar Novamente
              </button>
              <Link to="/games">
                <button className="btn-secondary" style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)' }}>
                  <ArrowLeft size={18} /> Hub de Jogos
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .float-anim {
          animation: floatY 6s ease-in-out infinite;
        }
        .hover-glow-effect:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
