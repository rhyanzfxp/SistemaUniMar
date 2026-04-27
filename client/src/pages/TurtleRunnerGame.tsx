import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useSound } from '../context/SoundContext';

type EntityType = 'trash' | 'jellyfish';

interface Entity {
  id: number;
  type: EntityType;
  emoji: string;
  x: number;
  y: number;
  passed: boolean;
}

const TRASH_EMOJIS = ['🛍️', '🛢️', '🥤', '🗑️', '🧴'];
const JELLYFISH_EMOJI = '🪼';

const GRAVITY = 0.25;
const JUMP_STRENGTH = -4.0;
const MAX_FALL_SPEED = 6;
const TURTLE_X = 20;
const BASE_GAME_SPEED = 0.55;
const SPAWN_RATE = 1800;

export default function TurtleRunnerGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [score, setScore] = useState(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const turtleYRef = useRef(50);
  const turtleVyRef = useRef(0);
  const entitiesRef = useRef<Entity[]>([]);
  const gameSpeedRef = useRef(BASE_GAME_SPEED);
  
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const lastSpawnTimeRef = useRef(0);
  const nextEntityId = useRef(1);
  const requestRef = useRef<number | null>(null);
  const lastEntitiesLengthRef = useRef(0);
  
  const bgPosRef = useRef(0);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const endGame = useCallback(() => {
    playWrong();
    setGameState('gameover');
  }, [playWrong]);

  const jump = useCallback(() => {
    if (gameStateRef.current === 'start') {
      startGame();
    } else if (gameStateRef.current === 'playing') {
      turtleVyRef.current = JUMP_STRENGTH;
    }
  }, []);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    turtleYRef.current = 50;
    turtleVyRef.current = 0;
    entitiesRef.current = [];
    gameSpeedRef.current = BASE_GAME_SPEED;
    bgPosRef.current = 0;
    lastEntitiesLengthRef.current = 0;
    setEntitiesState([]);
    setGameState('playing');
  };

  const updateGame = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    turtleVyRef.current += GRAVITY;
    if (turtleVyRef.current > MAX_FALL_SPEED) turtleVyRef.current = MAX_FALL_SPEED;
    turtleYRef.current += turtleVyRef.current;

    if (turtleYRef.current > 95) {
      endGame();
      return;
    }
    if (turtleYRef.current < 5) {
      turtleYRef.current = 5;
      turtleVyRef.current = 0;
    }

    gameSpeedRef.current = BASE_GAME_SPEED + Math.floor(scoreRef.current / 50) * 0.15;
    const currentSpawnRate = Math.max(700, SPAWN_RATE - Math.floor(scoreRef.current / 50) * 150);

    const now = Date.now();
    if (now - lastSpawnTimeRef.current > currentSpawnRate) {
      lastSpawnTimeRef.current = now;
      
      const isTrash = Math.random() > 0.4;
      const emoji = isTrash ? TRASH_EMOJIS[Math.floor(Math.random() * TRASH_EMOJIS.length)] : JELLYFISH_EMOJI;
      
      entitiesRef.current.push({
        id: nextEntityId.current++,
        type: isTrash ? 'trash' : 'jellyfish',
        emoji,
        x: 110,
        y: Math.random() * 70 + 15,
        passed: false
      });
    }

    let newScore = scoreRef.current;
    
    entitiesRef.current = entitiesRef.current.map(ent => ({ ...ent, x: ent.x - gameSpeedRef.current })).filter(ent => {
      if (ent.x < -10) return false;

      const dx = Math.abs(ent.x - TURTLE_X);
      const dy = Math.abs(ent.y - turtleYRef.current);
      
      if (dx < 4.5 && dy < 7.5) {
        if (ent.type === 'trash') {
          endGame();
          return true;
        } else if (ent.type === 'jellyfish') {
          playCorrect();
          newScore += 10;
          if (newScore >= 200 && gameStateRef.current !== 'victory') {
             gameStateRef.current = 'victory';
             setGameState('victory');
             playFanfare();
          }
          return false;
        }
      }
      return true;
    });

    if (newScore !== scoreRef.current) {
      scoreRef.current = newScore;
      setScore(newScore);
    }

    bgPosRef.current -= gameSpeedRef.current * 0.5;

    if (entitiesRef.current.length !== lastEntitiesLengthRef.current) {
      lastEntitiesLengthRef.current = entitiesRef.current.length;
      setEntitiesState([...entitiesRef.current]);
    }

    if (canvasRef.current) {
      const turtleEl = document.getElementById('turtle-player');
      if (turtleEl) {
        turtleEl.style.top = `${turtleYRef.current}%`;
        const rotation = Math.min(Math.max(turtleVyRef.current * 5, -20), 45);
        turtleEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }

      const bgEl = document.getElementById('game-bg');
      if (bgEl) {
        bgEl.style.backgroundPosition = `${bgPosRef.current}px 0`;
      }

      entitiesRef.current.forEach(ent => {
        const el = document.getElementById(`entity-${ent.id}`);
        if (el) {
          el.style.left = `${ent.x}%`;
          el.style.top = `${ent.y}%`;
        }
      });
    }

    if (gameStateRef.current === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [endGame, playCorrect]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastSpawnTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  
  const [entitiesState, setEntitiesState] = useState<Entity[]>([]);
  
  useEffect(() => {
    
    setEntitiesState(entitiesRef.current);
  }, []);



  return (
    <div 
      style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#0C4A6E', overflow: 'hidden', userSelect: 'none' }}
      onMouseDown={jump}
      onTouchStart={(e) => { e.preventDefault(); jump(); }}
      ref={canvasRef}
    >
      
      {}
      <div 
        id="game-bg"
        style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(180deg, #0284C7 0%, #082F49 100%)',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 2px, transparent 2px)',
          backgroundSize: '100px 100px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} 
      />

      {}
      <div style={{ position: 'relative', zIndex: 10, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <Link to="/games" style={{ pointerEvents: 'auto' }}>
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1.4rem', background: 'rgba(0,0,0,0.4)', padding: '6px 20px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {score} pts
          </div>
        </div>
      </div>

      {}
      {gameState === 'playing' && score === 0 && (
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', pointerEvents: 'none', animation: 'fade-in-out 2s infinite' }}>
          Clique repetidamente para nadar!
        </div>
      )}

      {}
      <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        
        {}
        <div
          id="turtle-player"
          style={{
            position: 'absolute',
            left: `${TURTLE_X}%`,
            top: `${gameState === 'start' ? 50 : turtleYRef.current}%`,
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            transform: 'translate(-50%, -50%)',
            transition: gameState === 'start' ? 'top 0.5s ease' : 'none',
            zIndex: 5,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
          }}
        >
          🐢
        </div>

        {}
        {entitiesState.map(ent => (
          <div
            key={ent.id}
            id={`entity-${ent.id}`}
            style={{
              position: 'absolute',
              left: `${ent.x}%`,
              top: `${ent.y}%`,
              fontSize: ent.type === 'jellyfish' ? 'clamp(2rem, 4vw, 3rem)' : 'clamp(2.5rem, 5vw, 3.5rem)',
              transform: 'translate(-50%, -50%)',
              filter: ent.type === 'trash' ? 'drop-shadow(0 0 10px rgba(255,0,0,0.4))' : 'drop-shadow(0 0 10px rgba(0,255,255,0.4))',
              zIndex: 4,
              willChange: 'left, top',
            }}
          >
            {ent.emoji}
          </div>
        ))}
      </div>

      {}
      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.5)', backdropFilter: 'blur(4px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center', margin: '20px', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🐢</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#10B981', marginBottom: '16px' }}>Mergulho da Tartaruga</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px', lineHeight: 1.6 }}>
              O oceano é uma pista de obstáculos!<br/><br/>
              🎮 Pressione <strong>Espaço</strong> ou <strong>Clique na tela</strong> para nadar para cima.<br/>
              🪼 Coma as <strong>águas-vivas</strong> para ganhar 10 pontos.<br/>
              ⚠️ <strong>Morte Súbita:</strong> Desvie do lixo! Um toque e é Game Over.
            </p>
            <button className="btn-primary" onClick={(e) => { e.stopPropagation(); jump(); }} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Nadar Agora!
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(8px)', zIndex: 20, animation: 'fade-in 0.3s ease-out' }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💥</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Game Over</h1>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>Você colidiu com o lixo oceânico ou bateu no fundo!</p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#10B981', margin: 0, lineHeight: 1 }}>{score}</p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); startGame(); }} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RotateCcw size={18} /> Tentar Novamente
              </button>
              <Link to="/games" style={{ flex: 1 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
                  Sair do Jogo
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {gameState === 'victory' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.2)', backdropFilter: 'blur(8px)', zIndex: 20, animation: 'fade-in 0.3s ease-out' }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#FCD34D', marginBottom: '8px' }}>Vitória!</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px' }}>Você sobreviveu ao oceano de lixo e comeu muitas águas-vivas!</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); startGame(); }} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <RotateCcw size={18} /> Jogar Novamente
              </button>
              <Link to="/games" style={{ flex: 1 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
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
