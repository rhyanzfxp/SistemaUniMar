import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Heart } from 'lucide-react';
import { useSound } from '../context/SoundContext';

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

const BASE_SPEED = 0.4; 
const SPAWN_RATE = 1200; 

export default function OceanCleanupGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [itemsState, setItemsState] = useState<FallingItem[]>([]);
  
  const itemsRef = useRef<FallingItem[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<'start' | 'playing' | 'gameover' | 'victory'>('start');
  
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextId = useRef(1);
  const lastItemsLengthRef = useRef(0);

  useEffect(() => { itemsRef.current = itemsState; }, [itemsState]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

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

  const updateGame = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const now = Date.now();
    const currentScore = scoreRef.current;
    
    const difficultyMultiplier = 1 + Math.floor(currentScore / 100) * 0.15;
    const currentSpawnRate = Math.max(300, SPAWN_RATE / difficultyMultiplier);
    
    if (now - lastSpawnTime.current > currentSpawnRate) {
      lastSpawnTime.current = now;
      const isTrash = Math.random() > 0.35; 
      const emojiList = isTrash ? TRASH_EMOJIS : FISH_EMOJIS;
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      
      const newItem: FallingItem = {
        id: nextId.current++,
        type: isTrash ? 'trash' : 'fish',
        emoji,
        x: Math.floor(Math.random() * 85) + 5, 
        y: -10, 
        speed: (BASE_SPEED + Math.random() * 0.2) * difficultyMultiplier,
      };
      itemsRef.current.push(newItem);
    }

    if (itemsRef.current.length !== lastItemsLengthRef.current) {
      lastItemsLengthRef.current = itemsRef.current.length;
      setItemsState([...itemsRef.current]);
    }

    let livesLost = 0;
    itemsRef.current = itemsRef.current.map(item => ({ ...item, y: item.y + item.speed })).filter(item => {
      const el = document.getElementById(`item-${item.id}`);
      if (el) {
        el.style.top = `${item.y}%`;
      }

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
        if (newScore >= 250 && gameStateRef.current !== 'victory') {
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
    itemsRef.current = [];
    lastItemsLengthRef.current = 0;
    setItemsState([]);
    setGameState('playing');
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#020617', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0284C7 0%, #0F172A 100%)', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '10%', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'skewX(-15deg)' }} />
        <div style={{ position: 'absolute', top: 0, right: '30%', width: '15%', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 100%)', transform: 'skewX(-15deg)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px', display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map((life) => (
              <Heart key={life} size={18} fill={life <= lives ? '#EF4444' : 'transparent'} color={life <= lives ? '#EF4444' : '#475569'} style={{ transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1.2rem', background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px' }}>
            {score} pts
          </div>
        </div>
      </div>

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
              filter: item.type === 'trash' ? 'drop-shadow(0 0 10px rgba(255,0,0,0.4))' : 'drop-shadow(0 0 10px rgba(0,255,0,0.2))',
              transform: 'translate(-50%, -50%)',
              transition: 'none',
              willChange: 'top',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧹</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#00D4FF', marginBottom: '16px' }}>Limpeza Oceânica</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px', lineHeight: 1.6 }}>
              Os animais marinhos estão em perigo! O lixo está caindo e você precisa agir rápido.<br/><br/>
              ✔️ <strong>Clique no lixo</strong> (🥤, 🛢️) antes que chegue ao fundo.<br/>
              ❌ <strong>Não clique nos animais</strong> (🐠, 🐢) ou perderá uma vida!
            </p>
            <button className="btn-primary" onClick={startGame} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%' }}>
              Iniciar Limpeza!
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💀</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Game Over</h1>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>Você deixou muito lixo cair ou assustou os peixes.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#00D4FF', margin: 0, lineHeight: 1 }}>{score}</p>
            </div>

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

      {gameState === 'victory' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#FCD34D', marginBottom: '8px' }}>Vitória!</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px' }}>O oceano está limpo graças a você!</p>
            
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
    </div>
  );
}
