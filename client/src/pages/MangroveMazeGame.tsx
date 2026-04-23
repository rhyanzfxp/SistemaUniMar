import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Clock, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const INITIAL_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TOTAL_BABIES = 4;
const TIME_LIMIT = 45;

export default function MangroveMazeGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [babiesCollected, setBabiesCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const stateRef = useRef({ gameState: 'start' });

  useEffect(() => { stateRef.current.gameState = gameState; }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('gameover');
            playWrong();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, playWrong]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (stateRef.current.gameState !== 'playing') return;

    setPlayerPos((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;

      if (nx >= 0 && nx < 12 && ny >= 0 && ny < 12) {
        const cell = maze[ny][nx];
        if (cell !== 1) {
          
          if (cell === 2) {
            playCorrect();
            setBabiesCollected(c => c + 1);
            setMaze(m => {
              const newM = [...m];
              newM[ny] = [...newM[ny]];
              newM[ny][nx] = 0;
              return newM;
            });
          } else if (cell === 3) {
            setBabiesCollected(c => {
              if (c >= TOTAL_BABIES) {
                setGameState('victory');
                playFanfare();
              } else {
                playWrong();
              }
              return c;
            });
            if (babiesCollected < TOTAL_BABIES) {
              return prev;
            }
          }
          return { x: nx, y: ny };
        }
      }
      return prev;
    });
  }, [maze, babiesCollected, playCorrect, playWrong, playFanfare]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) movePlayer(0, -1);
      if (['ArrowDown', 's', 'S'].includes(e.key)) movePlayer(0, 1);
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) movePlayer(-1, 0);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  const startGame = () => {
    setMaze(INITIAL_MAZE.map(row => [...row]));
    setPlayerPos({ x: 1, y: 1 });
    setBabiesCollected(0);
    setTimeLeft(TIME_LIMIT);
    setGameState('playing');
  };

  const getCellContent = (val: number, x: number, y: number) => {
    if (playerPos.x === x && playerPos.y === y) return '🦀';
    if (val === 1) return '🌿';
    if (val === 2) return '🐣';
    if (val === 3) return '🏁';
    return '';
  };

  const getCellBg = (val: number) => {
    if (val === 1) return '#064E3B';
    if (val === 3) return 'rgba(16,185,129,0.3)';
    return 'rgba(255,255,255,0.05)';
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#022C22', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px', display: 'flex', gap: '8px', alignItems: 'center', color: timeLeft <= 10 ? '#EF4444' : '#E2E8F0', fontWeight: 800 }}>
            <Clock size={18} /> {timeLeft}s
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px', display: 'flex', gap: '8px', alignItems: 'center', color: '#FCD34D', fontWeight: 800 }}>
            🐣 {babiesCollected}/{TOTAL_BABIES}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '20px' }}>
        
        {gameState !== 'start' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, minmax(20px, 40px))', 
            gap: '2px', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '8px', 
            borderRadius: '12px',
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            {maze.map((row, y) => (
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    aspectRatio: '1',
                    background: getCellBg(cell),
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    transition: 'all 0.2s',
                    transform: (playerPos.x === x && playerPos.y === y) ? 'scale(1.1)' : 'scale(1)',
                    zIndex: (playerPos.x === x && playerPos.y === y) ? 5 : 1
                  }}
                >
                  {getCellContent(cell, x, y)}
                </div>
              ))
            ))}
          </div>
        )}

        {gameState === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '30px', opacity: 0.8 }}>
            <button onClick={() => movePlayer(0, -1)} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}><ArrowUp size={24} /></button>
            <div style={{ display: 'flex', gap: '40px' }}>
              <button onClick={() => movePlayer(-1, 0)} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}><ArrowLeftIcon size={24} /></button>
              <button onClick={() => movePlayer(1, 0)} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}><ArrowRight size={24} /></button>
            </div>
            <button onClick={() => movePlayer(0, 1)} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}><ArrowDown size={24} /></button>
          </div>
        )}

      </div>

      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🦀</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#10B981', marginBottom: '16px' }}>Resgate no Mangue</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px', lineHeight: 1.6 }}>
              Os filhotes de caranguejo estão perdidos nas raízes do manguezal!<br/><br/>
              🦀 Use as <strong>Setas</strong> ou <strong>WASD</strong> para mover.<br/>
              👶 Resgate os <strong>4 filhotes</strong> perdidos.<br/>
              🏁 Chegue à <strong>saída</strong> antes que o tempo acabe.
            </p>

            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>💡 Você sabia?</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
                Os manguezais do Rio Cocó e Rio Ceará são berçários fundamentais. Praticamente todos os camarões e caranguejos que consumimos em Fortaleza passaram parte da vida protegidos por essas raízes!
              </p>
            </div>

            <button className="btn-primary" onClick={startGame} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Iniciar Resgate!
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⏱️</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Tempo Esgotado</h1>
            <p style={{ color: '#94A3B8', marginBottom: '32px' }}>A maré subiu e você não conseguiu resgatar todos a tempo.</p>
            
            <button className="btn-primary" onClick={startGame} style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RotateCcw size={18} /> Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {gameState === 'victory' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#FCD34D', marginBottom: '8px' }}>Resgate Concluído!</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '32px' }}>Você salvou os filhotes e encontrou a saída do manguezal. Excelente trabalho de preservação!</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/games" style={{ flex: 1 }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ArrowLeft size={18} /> Sair
                </button>
              </Link>
              <button className="btn-primary" onClick={startGame} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <RotateCcw size={18} /> De Novo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
