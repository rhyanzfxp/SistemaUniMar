import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Heart, Zap } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import EmojiImg from '../components/EmojiImg';
import ScoreSaver from '../components/game/ScoreSaver';

type ItemType = 'trash' | 'fish';

interface FallingItem {
  id: number;
  type: ItemType;
  emoji: string;
  x: number;
  y: number;
  speed: number;
}

const TRASH_EMOJIS = ['🥤', '🛢️', '🗑️', '🛍️', '🥫'];
const FISH_EMOJIS = ['🐠', '🐢', '🐬', '🐡', '🐙'];


const LEVEL_THRESHOLDS = [0, 50, 100, 150, 200];

interface LevelConfig {
  label: string;
  color: string;
  baseSpeed: number;      
  spawnRate: number;       
  trashRatio: number;      
  speedVariance: number;   
}

const LEVEL_CONFIGS: LevelConfig[] = [
  
  { label: 'Nível 1', color: '#10B981', baseSpeed: 0.30, spawnRate: 1600, trashRatio: 0.60, speedVariance: 0.08 },
  
  { label: 'Nível 2', color: '#3B82F6', baseSpeed: 0.55, spawnRate: 1200, trashRatio: 0.65, speedVariance: 0.12 },
  
  { label: 'Nível 3', color: '#F59E0B', baseSpeed: 0.80, spawnRate: 900,  trashRatio: 0.70, speedVariance: 0.18 },
  
  { label: 'Nível 4', color: '#EF4444', baseSpeed: 1.10, spawnRate: 650,  trashRatio: 0.75, speedVariance: 0.25 },
  
  { label: 'Nível 5', color: '#A855F7', baseSpeed: 1.45, spawnRate: 450,  trashRatio: 0.78, speedVariance: 0.30 },
];

const VICTORY_SCORE = 250;

function getLevelIndex(score: number): number {
  let idx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) { idx = i; break; }
  }
  return Math.min(idx, LEVEL_CONFIGS.length - 1);
}

export default function OceanCleanupGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [itemsState, setItemsState] = useState<FallingItem[]>([]);

  const itemsRef = useRef<FallingItem[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const levelRef = useRef(0);
  const gameStateRef = useRef<'start' | 'playing' | 'gameover' | 'victory'>('start');

  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextId = useRef(1);
  const lastItemsLengthRef = useRef(0);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    const newLevel = getLevelIndex(score);
    if (newLevel !== levelRef.current) {
      levelRef.current = newLevel;
      setCurrentLevel(newLevel);
      if (newLevel > 0) {
        setLevelUpAnim(true);
        setTimeout(() => setLevelUpAnim(false), 1800);
      }
    }
    scoreRef.current = score;
  }, [score]);

  const endGame = useCallback(() => {
    setGameState('gameover');
    setItemsState([]);
    playFanfare();
  }, [playFanfare]);

  const loseLife = useCallback(() => {
    playWrong();
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        endGame();
        return 0;
      }
      return newLives;
    });
  }, [playWrong, endGame]);

  useLayoutEffect(() => {
    itemsRef.current.forEach(item => {
      const el = document.getElementById(`item-${item.id}`);
      if (el) el.style.top = `${item.y}%`;
    });
  });

  const updateGame = useCallback((timestamp: number) => {
    if (gameStateRef.current !== 'playing') return;

    const delta = lastFrameTimeRef.current
      ? Math.min((timestamp - lastFrameTimeRef.current) / 16.667, 3)
      : 1;
    lastFrameTimeRef.current = timestamp;

    const now = Date.now();
    const lvl = LEVEL_CONFIGS[levelRef.current];

    // Spawn — y: -15 garante que começa acima da área visível
    if (now - lastSpawnTime.current > lvl.spawnRate) {
      lastSpawnTime.current = now;
      const isTrash = Math.random() < lvl.trashRatio;
      const emojiList = isTrash ? TRASH_EMOJIS : FISH_EMOJIS;
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

      const newItem: FallingItem = {
        id: nextId.current++,
        type: isTrash ? 'trash' : 'fish',
        emoji,
        x: Math.floor(Math.random() * 85) + 5,
        y: -15,
        speed: lvl.baseSpeed + Math.random() * lvl.speedVariance,
      };
      itemsRef.current.push(newItem);
    }

    if (itemsRef.current.length !== lastItemsLengthRef.current) {
      lastItemsLengthRef.current = itemsRef.current.length;
      setItemsState([...itemsRef.current]);
    }

    let livesLost = 0;
    itemsRef.current = itemsRef.current
      .map(item => ({ ...item, y: item.y + item.speed * delta }))
      .filter(item => {
        const el = document.getElementById(`item-${item.id}`);
        if (el) el.style.top = `${item.y}%`;

        if (item.y > 105) {
          if (item.type === 'trash') livesLost++;
          return false;
        }
        return true;
      });

    if (livesLost > 0) {
      for (let i = 0; i < livesLost; i++) loseLife();
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [loseLife]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastSpawnTime.current = Date.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  const handleItemClick = (id: number, type: ItemType) => {
    if (gameState !== 'playing') return;

    if (type === 'trash') {
      playCorrect();
      setScore(prev => {
        const newScore = prev + 10;
        if (newScore >= VICTORY_SCORE && gameStateRef.current !== 'victory') {
          gameStateRef.current = 'victory';
          setGameState('victory');
          setItemsState([]);
          playFanfare();
        }
        return newScore;
      });
    } else {
      loseLife();
    }

    itemsRef.current = itemsRef.current.filter(i => i.id !== id);
    setItemsState([...itemsRef.current]);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCurrentLevel(0);
    setLevelUpAnim(false);
    levelRef.current = 0;
    scoreRef.current = 0;
    itemsRef.current = [];
    lastItemsLengthRef.current = 0;
    lastFrameTimeRef.current = 0;
    setItemsState([]);
    setGameState('playing');
  };

  const lvlConfig = LEVEL_CONFIGS[currentLevel];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1] ?? VICTORY_SCORE;
  const prevThreshold = LEVEL_THRESHOLDS[currentLevel] ?? 0;
  const levelProgress = Math.min(
    ((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100,
    100
  );

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#020617', overflow: 'hidden' }}>

      {/* Fundo */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0284C7 0%, #0F172A 100%)', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '10%', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'skewX(-15deg)' }} />
        <div style={{ position: 'absolute', top: 0, right: '30%', width: '15%', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 100%)', transform: 'skewX(-15deg)' }} />
      </div>

      {/* HUD */}
      <div style={{ position: 'relative', zIndex: 10, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

        {/* Esquerda: Sair */}
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>

        {/* Centro: Nível + barra de progresso */}
        {gameState === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} fill={lvlConfig.color} color={lvlConfig.color} />
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem',
                color: lvlConfig.color, transition: 'color 0.4s',
                textShadow: `0 0 10px ${lvlConfig.color}88`
              }}>
                {lvlConfig.label}
              </span>
              <Zap size={14} fill={lvlConfig.color} color={lvlConfig.color} />
            </div>
            <div style={{ width: '140px', height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${levelProgress}%`,
                background: lvlConfig.color,
                borderRadius: '99px',
                transition: 'width 0.3s ease, background 0.4s ease',
                boxShadow: `0 0 6px ${lvlConfig.color}88`
              }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif' }}>
              {currentLevel < LEVEL_CONFIGS.length - 1 ? `próx. nível: ${nextThreshold} pts` : 'Nível máximo!'}
            </span>
          </div>
        )}

        {/* Direita: Vidas + Pontos */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '99px', display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map((life) => (
              <Heart key={life} size={18} fill={life <= lives ? '#EF4444' : 'transparent'} color={life <= lives ? '#EF4444' : '#475569'} style={{ transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1.2rem', background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px' }}>
            {score} pts
          </div>
        </div>
      </div>

      {/* Animação de subida de nível */}
      {levelUpAnim && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          textAlign: 'center',
          animation: 'level-up-pop 1.8s ease-out forwards',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '4px' }}>⚡</div>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.2rem',
            color: lvlConfig.color,
            textShadow: `0 0 30px ${lvlConfig.color}, 0 0 60px ${lvlConfig.color}88`,
          }}>
            {lvlConfig.label}!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
            Velocidade aumentou!
          </div>
        </div>
      )}

      {/* Itens caindo */}
      <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {itemsState.map(item => (
          <div
            key={item.id}
            id={`item-${item.id}`}
            onMouseDown={() => handleItemClick(item.id, item.type)}
            onTouchStart={(e) => { e.preventDefault(); handleItemClick(item.id, item.type); }}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              cursor: 'pointer',
              userSelect: 'none',
              filter: item.type === 'trash'
                ? 'drop-shadow(0 0 10px rgba(255,0,0,0.4))'
                : 'drop-shadow(0 0 10px rgba(0,255,0,0.2))',
              transform: 'translate(-50%, -50%)',
              transition: 'none',
              willChange: 'top',
            }}
          >
            <EmojiImg emoji={item.emoji} size="clamp(2.5rem, 6vw, 4rem)" />
          </div>
        ))}
      </div>

      {/* Tela de início */}
      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '520px', textAlign: 'center', margin: '20px' }}>
            <EmojiImg emoji="🧹" size="4rem" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#00D4FF', marginBottom: '16px' }}>Limpeza Oceânica</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '20px', lineHeight: 1.6 }}>
              Os animais marinhos estão em perigo! O lixo está caindo e você precisa agir rápido.<br /><br />
              ✔️ <strong>Clique no lixo</strong> (🥤, 🛢️) antes que chegue ao fundo.<br />
              ❌ <strong>Não clique nos animais</strong> (🐠, 🐢) ou perderá uma vida!
            </p>

            {/* Tabela de níveis */}
            <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ color: '#00D4FF', fontWeight: 800, fontSize: '0.8rem', margin: '0 0 10px', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Progressão de Níveis</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {LEVEL_CONFIGS.map((cfg, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${cfg.color}44` }}>
                    <div style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{cfg.label}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>{LEVEL_THRESHOLDS[i]}+ pts</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={startGame} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%' }}>
              Iniciar Limpeza!
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <EmojiImg emoji="💀" size="4rem" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Game Over</h1>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>Você deixou muito lixo cair ou assustou os peixes.</p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#00D4FF', margin: 0, lineHeight: 1 }}>{score}</p>
              <div style={{ marginTop: '10px', display: 'inline-block', background: `${LEVEL_CONFIGS[getLevelIndex(score)].color}22`, border: `1px solid ${LEVEL_CONFIGS[getLevelIndex(score)].color}55`, borderRadius: '99px', padding: '4px 14px' }}>
                <span style={{ fontSize: '0.8rem', color: LEVEL_CONFIGS[getLevelIndex(score)].color, fontWeight: 700 }}>
                  Chegou ao {LEVEL_CONFIGS[getLevelIndex(score)].label}
                </span>
              </div>
            </div>

            <ScoreSaver gameId="ocean-cleanup-001" score={score} />



            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={startGame} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RotateCcw size={18} /> Jogar Novamente
              </button>
              <Link to="/games" style={{ flex: 1 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Sair do Jogo
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Vitória */}
      {gameState === 'victory' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <EmojiImg emoji="🏆" size="4rem" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#FCD34D', marginBottom: '8px' }}>Vitória!</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px' }}>Você completou todos os níveis e o oceano está limpo graças a você!</p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#00D4FF', margin: 0, lineHeight: 1 }}>{score}</p>
            </div>

            <ScoreSaver gameId="ocean-cleanup-001" score={score} />

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={startGame} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
                <RotateCcw size={18} /> Jogar Novamente
              </button>
              <Link to="/games" style={{ flex: 1 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Sair do Jogo
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes level-up-pop {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          40%  { transform: translate(-50%, -50%) scale(1); }
          70%  { opacity: 1; transform: translate(-50%, -60%); }
          100% { opacity: 0; transform: translate(-50%, -80%); }
        }
      `}</style>
    </div>
  );
}
