import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { useSound } from '../context/SoundContext';

interface Species {
  id: string;
  name: string;
  emoji: string;
  correctZone: ZoneId;
  hint: string;
}

type ZoneId = 'root' | 'coastal' | 'water';

interface Zone {
  id: ZoneId;
  label: string;
  description: string;
  icon: string;
  color: string;
  glow: string;
  acceptedSpecies: string[]; 
}

interface PlacedItem {
  speciesId: string;
  correct: boolean;
}

const SPECIES: Species[] = [
  { id: 'caranguejo', name: 'Caranguejo-uçá', emoji: '🦀', correctZone: 'root', hint: 'Vive enterrado entre as raízes do mangue' },
  { id: 'ostra', name: 'Ostra', emoji: '🦪', correctZone: 'root', hint: 'Fixa nas raízes submersas do mangue' },
  { id: 'garça', name: 'Garça-branca', emoji: '🦢', correctZone: 'coastal', hint: 'Pousa na beira do manguezal para pescar' },
  { id: 'guaiamum', name: 'Guaiamum', emoji: '🦞', correctZone: 'root', hint: 'Escava tocas na lama das raízes' },
  { id: 'tainha', name: 'Tainha', emoji: '🐟', correctZone: 'water', hint: 'Peixe que habita as águas do estuário' },
  { id: 'siriu', name: 'Siri-azul', emoji: '🦐', correctZone: 'water', hint: 'Nada livremente nas águas rasas estuarinas' },
  { id: 'socozinho', name: 'Socó-do-mangue', emoji: '🐦', correctZone: 'coastal', hint: 'Ave que aninha no manguezal' },
  { id: 'robalo', name: 'Robalo', emoji: '🐠', correctZone: 'water', hint: 'Peixe predador das águas mais profundas' },
  { id: 'camarao', name: 'Camarão-rosa', emoji: '🦩', correctZone: 'water', hint: 'Juvenis crescem nas águas do manguezal' },
];

const ZONES: Zone[] = [
  {
    id: 'root',
    label: 'Zona de Raízes',
    description: 'Interior do manguezal, raízes submersas e lama',
    icon: '🌿',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
    acceptedSpecies: SPECIES.filter(s => s.correctZone === 'root').map(s => s.id),
  },
  {
    id: 'coastal',
    label: 'Zona Costeira',
    description: 'Margem do manguezal, solo úmido e transição',
    icon: '🏝️',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    acceptedSpecies: SPECIES.filter(s => s.correctZone === 'coastal').map(s => s.id),
  },
  {
    id: 'water',
    label: 'Zona Aquática',
    description: 'Estuário e canal, águas do manguezal',
    icon: '🌊',
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.3)',
    acceptedSpecies: SPECIES.filter(s => s.correctZone === 'water').map(s => s.id),
  },
];

export default function EcosystemGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [placed, setPlaced] = useState<Record<ZoneId, PlacedItem[]>>({ root: [], coastal: [], water: [] });
  const [remaining, setRemaining] = useState<Species[]>([...SPECIES]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<ZoneId | null>(null);
  const [feedback, setFeedback] = useState<{ speciesId: string; correct: boolean; hint: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchSpeciesId = useRef<string | null>(null);
  const touchGhost = useRef<HTMLDivElement | null>(null);
  const lastTouchTime = useRef<number>(0);

  const totalSpecies = SPECIES.length;
  const placedCount = Object.values(placed).reduce((a, b) => a + b.length, 0);
  const correctCount = Object.values(placed).reduce((a, b) => a + b.filter(x => x.correct).length, 0);

  const showFeedback = useCallback((speciesId: string, correct: boolean, hint: string) => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setFeedback({ speciesId, correct, hint });
    feedbackTimeout.current = setTimeout(() => setFeedback(null), 2200);
  }, []);

  const handleDrop = useCallback((zoneId: ZoneId, speciesId: string) => {
    const species = SPECIES.find(s => s.id === speciesId);
    if (!species) return;

    const isCorrect = species.correctZone === zoneId;
    const points = isCorrect ? 10 : 0;

    setPlaced(prev => ({
      ...prev,
      [zoneId]: [...prev[zoneId], { speciesId, correct: isCorrect }],
    }));
    setRemaining(prev => prev.filter(s => s.id !== speciesId));
    setScore(prev => prev + points);

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    showFeedback(speciesId, isCorrect, species.hint);

    const newRemaining = remaining.filter(s => s.id !== speciesId);
    if (newRemaining.length === 0) {
      setTimeout(() => {
        playFanfare();
        setFinished(true);
      }, 400);
    }
  }, [remaining, playCorrect, playWrong, playFanfare, showFeedback]);

  const onDragStart = (id: string) => setDraggedId(id);
  const onDragEnd = () => { setDraggedId(null); setOverZone(null); };
  const onDragOver = (e: React.DragEvent, zoneId: ZoneId) => { e.preventDefault(); setOverZone(zoneId); };
  const onDragLeave = () => setOverZone(null);
  const onDropZone = (e: React.DragEvent, zoneId: ZoneId) => {
    e.preventDefault();
    if (draggedId) handleDrop(zoneId, draggedId);
    setDraggedId(null);
    setOverZone(null);
  };

  const createGhost = (species: Species, x: number, y: number) => {
    const ghost = document.createElement('div');
    ghost.textContent = species.emoji;
    ghost.style.cssText = `
      position:fixed; z-index:9999; font-size:2rem;
      pointer-events:none; left:0; top:0;
      transform: translate3d(${x}px, ${y}px, 0) translate(-50%,-50%);
      filter: drop-shadow(0 4px 12px rgba(0,212,255,0.6));
      will-change: transform;
    `;
    document.body.appendChild(ghost);
    touchGhost.current = ghost;
  };

  const onTouchStart = (e: React.TouchEvent, speciesId: string) => {
    touchSpeciesId.current = speciesId;
    const touch = e.touches[0];
    const species = SPECIES.find(s => s.id === speciesId)!;
    createGhost(species, touch.clientX, touch.clientY);
    lastTouchTime.current = Date.now();
  };

  const onTouchMove = (e: React.TouchEvent) => {

    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];

    if (touchGhost.current) {
      touchGhost.current.style.transform = `translate3d(${touch.clientX}px, ${touch.clientY}px, 0) translate(-50%,-50%)`;
    }

    const now = Date.now();
    if (now - lastTouchTime.current > 60) {
      lastTouchTime.current = now;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const zoneEl = el?.closest('[data-zone]') as HTMLElement | null;
      setOverZone(zoneEl ? (zoneEl.dataset.zone as ZoneId) : null);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchGhost.current) { document.body.removeChild(touchGhost.current); touchGhost.current = null; }
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest('[data-zone]') as HTMLElement | null;
    if (zoneEl && touchSpeciesId.current) {
      handleDrop(zoneEl.dataset.zone as ZoneId, touchSpeciesId.current);
    }
    touchSpeciesId.current = null;
    setOverZone(null);
  };

  const handleReset = () => {
    setPlaced({ root: [], coastal: [], water: [] });
    setRemaining([...SPECIES]);
    setScore(0);
    setFinished(false);
    setFeedback(null);
  };

  const percentage = Math.round((correctCount / totalSpecies) * 100);

  if (finished) {
    const getGrade = () => {
      if (percentage >= 90) return { label: 'Naturalista do Mangue!', emoji: '🌿', color: '#10B981' };
      if (percentage >= 70) return { label: 'Explorador Costeiro!', emoji: '🏝️', color: '#F59E0B' };
      if (percentage >= 50) return { label: 'Aprendiz do Ecossistema', emoji: '🌊', color: '#00D4FF' };
      return { label: 'Continue Praticando!', emoji: '🌱', color: '#94A3B8' };
    };
    const grade = getGrade();
    return (
      <div style={{ padding: 'clamp(32px, 8vw, 60px) 16px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(3.5rem, 12vw, 5rem)', marginBottom: '16px', animation: 'scale-in 0.5s ease-out' }}>{grade.emoji}</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: grade.color, marginBottom: '8px' }}>{grade.label}</h1>
        <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '0.9rem' }}>Ecossistema do Manguezal · Resultado</p>

        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', margin: '0 0 4px', background: 'linear-gradient(135deg, #10B981, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {score}
          </p>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 20px' }}>de {totalSpecies * 10} pontos · {percentage}%</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '8px', marginBottom: '20px', overflow: 'hidden' }}>
            <div className="progress-bar" style={{ height: '100%', width: `${percentage}%` }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#10B981', margin: 0 }}>{correctCount}</p>
              <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>Corretas</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#EF4444', margin: 0 }}>{totalSpecies - correctCount}</p>
              <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>Erradas</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleReset} style={{ padding: '12px 24px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> Jogar Novamente
          </button>
          <Link to="/games"><button className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowLeft size={16} /> Outros Jogos</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 5vw, 40px) 16px', maxWidth: '900px', margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🌿</span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#10B981', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>Ecossistema do Manguezal</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>{score} pts</span>
          <button onClick={handleReset} title="Reiniciar" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569' }}>
        <span>{placedCount}/{totalSpecies} colocadas</span>
        <span>{correctCount} corretas</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '5px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(placedCount / totalSpecies) * 100}%`, background: 'linear-gradient(90deg, #10B981, #00D4FF)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>

      <div className="glass-card" style={{ padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>💡</span>
        <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#E2E8F0' }}>Arraste</strong> cada espécie para a zona correta do manguezal.
          Em telas touch, pressione e arraste.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 200, padding: '12px 20px', borderRadius: '12px',
            background: feedback.correct ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
            border: `1px solid ${feedback.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            backdropFilter: 'blur(12px)',
            animation: 'slide-up 0.3s ease-out',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: feedback.correct ? '#10B981' : '#EF4444', margin: '0 0 4px', fontSize: '0.9rem' }}>
            {feedback.correct ? '✅ Correto!' : '❌ Zona errada!'}
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>{feedback.hint}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {ZONES.map((zone) => {
          const isOver = overZone === zone.id;
          const zoneItems = placed[zone.id];
          return (
            <div
              key={zone.id}
              data-zone={zone.id}
              onDragOver={(e) => onDragOver(e, zone.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDropZone(e, zone.id)}
              className="glass-card"
              style={{
                minHeight: '180px',
                padding: '16px',
                borderColor: isOver ? zone.color : 'rgba(255,255,255,0.08)',
                borderWidth: '2px',
                borderStyle: 'dashed',
                background: isOver ? `${zone.color}08` : 'rgba(255,255,255,0.03)',
                boxShadow: isOver ? `0 0 20px ${zone.glow}` : 'none',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
            >

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>{zone.icon}</span>
                <div>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: zone.color, margin: '0 0 2px', fontSize: '0.88rem' }}>{zone.label}</p>
                  <p style={{ color: '#475569', fontSize: '0.72rem', margin: 0 }}>{zone.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '60px' }}>
                {zoneItems.map(({ speciesId, correct }) => {
                  const sp = SPECIES.find(s => s.id === speciesId)!;
                  return (
                    <div
                      key={speciesId}
                      title={sp.name}
                      style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1.5px solid ${correct ? '#10B981' : '#EF4444'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem',
                        animation: 'scale-in 0.3s ease-out',
                        position: 'relative',
                      }}
                    >
                      {sp.emoji}
                      <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', fontSize: '0.6rem' }}>
                        {correct ? '✅' : '❌'}
                      </span>
                    </div>
                  );
                })}

                {zoneItems.length === 0 && (
                  <p style={{ color: '#2a3a4a', fontSize: '0.78rem', fontStyle: 'italic', margin: 'auto' }}>
                    Arraste espécies aqui
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '18px' }}>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#94A3B8', fontSize: '0.8rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          🐾 Espécies — arraste para a zona correta
        </p>
        {remaining.length === 0 ? (
          <p style={{ color: '#475569', fontSize: '0.88rem', textAlign: 'center', padding: '16px 0' }}>Todas as espécies foram colocadas!</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {remaining.map((species) => (
              <div
                key={species.id}
                draggable
                onDragStart={() => onDragStart(species.id)}
                onDragEnd={onDragEnd}
                onTouchStart={(e) => onTouchStart(e, species.id)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="species-chip"
                title={species.hint}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '99px',
                  background: draggedId === species.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${draggedId === species.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'grab', userSelect: 'none',
                  transition: 'all 0.2s',
                  opacity: draggedId === species.id ? 0.5 : 1,
                  fontSize: '0.88rem',
                  fontFamily: 'Inter, sans-serif',
                  color: '#CBD5E1',
                  touchAction: 'none',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{species.emoji}</span>
                {species.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .species-chip:hover {
          border-color: rgba(0,212,255,0.35) !important;
          background: rgba(0,212,255,0.08) !important;
          transform: translateY(-2px);
        }
        .species-chip:active { cursor: grabbing; }
      `}</style>
    </div>
  );
}
