import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Heart, Zap } from 'lucide-react';
import { useSound } from '../context/SoundContext';

type Enemy = { id: number; x: number; y: number; speed: number; hp: number; maxHp: number; emoji: string };
type Projectile = { id: number; x: number; y: number; targetId: number; dx: number; dy: number };
type Tower = { id: number; spotIndex: number; lastFireTime: number };

const CENTER_X = 50;
const CENTER_Y = 50;
const TOWER_SPOTS = [
  { x: 50, y: 35 }, { x: 65, y: 50 }, { x: 50, y: 65 }, { x: 35, y: 50 },
  { x: 60, y: 40 }, { x: 60, y: 60 }, { x: 40, y: 60 }, { x: 40, y: 40 },
];

export default function CoralDefenderGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [energy, setEnergy] = useState(50);
  const [coralHp, setCoralHp] = useState(100);
  const [score, setScore] = useState(0);
  const [towers, setTowers] = useState<Tower[]>([]);
  
  const [enemiesState, setEnemiesState] = useState<Enemy[]>([]);
  const [projectilesState, setProjectilesState] = useState<Projectile[]>([]);

  const stateRef = useRef({
    gameState: 'start',
    energy: 50,
    coralHp: 100,
    score: 0,
    towers: [] as Tower[],
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    lastEnemySpawn: 0,
    lastEnergyTick: 0,
    nextEnemyId: 1,
    nextProjId: 1,
    nextTowerId: 1,
  });

  const requestRef = useRef<number | null>(null);

  useEffect(() => { stateRef.current.gameState = gameState; }, [gameState]);
  useEffect(() => { stateRef.current.energy = energy; }, [energy]);
  useEffect(() => { stateRef.current.coralHp = coralHp; }, [coralHp]);
  useEffect(() => { stateRef.current.score = score; }, [score]);
  useEffect(() => { stateRef.current.towers = towers; }, [towers]);

  const endGame = useCallback(() => {
    setGameState('gameover');
    playFanfare();
  }, [playFanfare]);

  const lastFrameTimeRef = useRef<number>(0);

  const updateGame = useCallback((timestamp: number) => {
    if (stateRef.current.gameState !== 'playing') return;

    const delta = lastFrameTimeRef.current ? Math.min((timestamp - lastFrameTimeRef.current) / 16.667, 3) : 1;
    lastFrameTimeRef.current = timestamp;

    const now = Date.now();
    const st = stateRef.current;

    if (now - st.lastEnergyTick > 1000) {
      st.energy = Math.min(200, st.energy + 5);
      setEnergy(st.energy);
      st.lastEnergyTick = now;
    }

    const spawnRate = Math.max(800, 2500 - st.score * 5);
    if (now - st.lastEnemySpawn > spawnRate) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60;
      const x = CENTER_X + Math.cos(angle) * dist;
      const y = CENTER_Y + Math.sin(angle) * dist * (window.innerWidth < 600 ? 1.5 : 1);
      
      const isTrash = Math.random() > 0.5;
      const hp = isTrash ? 2 : 3 + Math.floor(st.score / 200);
      
      st.enemies.push({
        id: st.nextEnemyId++,
        x, y,
        speed: 0.05 + Math.random() * 0.05 + (st.score / 5000),
        hp, maxHp: hp,
        emoji: isTrash ? '🛢️' : '🐡'
      });
      st.lastEnemySpawn = now;
    }

    st.towers.forEach(tower => {
      if (now - tower.lastFireTime > 1200) {
        let closest = null;
        let minDist = 30;
        const spot = TOWER_SPOTS[tower.spotIndex];

        st.enemies.forEach(e => {
          const d = Math.hypot(e.x - spot.x, e.y - spot.y);
          if (d < minDist) { minDist = d; closest = e; }
        });

        if (closest) {
          const angle = Math.atan2((closest as Enemy).y - spot.y, (closest as Enemy).x - spot.x);
          st.projectiles.push({
            id: st.nextProjId++,
            x: spot.x, y: spot.y,
            targetId: (closest as Enemy).id,
            dx: Math.cos(angle) * 0.8,
            dy: Math.sin(angle) * 0.8
          });
          tower.lastFireTime = now;
        }
      }
    });

    for (let i = st.projectiles.length - 1; i >= 0; i--) {
      const p = st.projectiles[i];
      p.x += p.dx * delta;
      p.y += p.dy * delta;

      const target = st.enemies.find(e => e.id === p.targetId);
      let hit = false;
      
      if (target && Math.hypot(target.x - p.x, target.y - p.y) < 3) {
        target.hp -= 1;
        hit = true;
        if (target.hp <= 0) {
          st.score += 10;
          setScore(st.score);
          playCorrect();
          
          if (st.score >= 500 && st.gameState !== 'victory') {
            st.gameState = 'victory';
            setGameState('victory');
            playFanfare();
          }
        }
      } else if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) {
        hit = true;
      }

      if (hit) st.projectiles.splice(i, 1);
    }

    for (let i = st.enemies.length - 1; i >= 0; i--) {
      const e = st.enemies[i];
      if (e.hp <= 0) {
        st.enemies.splice(i, 1);
        continue;
      }

      const angle = Math.atan2(CENTER_Y - e.y, CENTER_X - e.x);
      e.x += Math.cos(angle) * e.speed * delta;
      e.y += Math.sin(angle) * e.speed * delta;

      if (Math.hypot(CENTER_X - e.x, CENTER_Y - e.y) < 5) {
        st.coralHp -= e.maxHp * 5;
        setCoralHp(st.coralHp);
        st.enemies.splice(i, 1);
        playWrong();
        if (st.coralHp <= 0) {
          endGame();
        }
      }
    }

    setEnemiesState([...st.enemies]);
    setProjectilesState([...st.projectiles]);

    if (st.coralHp > 0) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [endGame, playCorrect, playWrong]);

  useEffect(() => {
    if (gameState === 'playing') {
      stateRef.current.lastEnemySpawn = Date.now();
      stateRef.current.lastEnergyTick = Date.now();
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  const startGame = () => {
    stateRef.current = {
      gameState: 'playing',
      energy: 50,
      coralHp: 100,
      score: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      lastEnemySpawn: Date.now(),
      lastEnergyTick: Date.now(),
      nextEnemyId: 1,
      nextProjId: 1,
      nextTowerId: 1,
    };
    lastFrameTimeRef.current = 0;
    setGameState('playing');
    setEnergy(50);
    setCoralHp(100);
    setScore(0);
    setTowers([]);
    setEnemiesState([]);
    setProjectilesState([]);
  };

  const placeTower = (spotIndex: number) => {
    if (gameState !== 'playing' || energy < 40) return;
    if (towers.some(t => t.spotIndex === spotIndex)) return;
    
    setEnergy(e => e - 40);
    setTowers(prev => {
      const newTowers = [...prev, { id: stateRef.current.nextTowerId++, spotIndex, lastFireTime: 0 }];
      stateRef.current.towers = newTowers;
      return newTowers;
    });
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#064E3B', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #0284C7 0%, #064E3B 100%)', opacity: 0.8 }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px', display: 'flex', gap: '8px', alignItems: 'center', color: '#10B981', fontWeight: 800 }}>
            <Heart size={18} fill="#10B981" /> {Math.max(0, coralHp)}%
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px', display: 'flex', gap: '8px', alignItems: 'center', color: '#F59E0B', fontWeight: 800 }}>
            <Zap size={18} fill="#F59E0B" /> {energy}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1.2rem', background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px' }}>
            {score} pts
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        
        <div 
          className={`coral-sprite ${coralHp < 50 ? 'damaged' : ''}`}
          style={{ 
            position: 'absolute', 
            left: `${CENTER_X}%`, 
            top: `${CENTER_Y}%`, 
            transform: 'translate(-50%, -50%)', 
            fontSize: '6rem', 
            filter: `drop-shadow(0 0 ${coralHp / 5}px rgba(16,185,129,0.5))`, 
            transition: 'filter 0.3s',
            animation: coralHp < 100 && coralHp % 10 !== 0 ? 'shake 0.4s ease-in-out' : 'none'
          }}
        >
          🪸
        </div>

        {TOWER_SPOTS.map((spot, i) => {
          const tower = towers.find(t => t.spotIndex === i);
          return (
            <div
              key={`spot-${i}`}
              onClick={() => placeTower(i)}
              style={{
                position: 'absolute',
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: tower ? 'none' : '2px dashed rgba(255,255,255,0.3)',
                background: tower ? 'transparent' : (energy >= 40 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                cursor: tower ? 'default' : (energy >= 40 ? 'pointer' : 'not-allowed'),
                zIndex: 5
              }}
            >
              {tower && '🐟'}
            </div>
          );
        })}

        {enemiesState.map(e => (
          <div
            key={e.id}
            style={{
              position: 'absolute',
              left: `${e.x}%`,
              top: `${e.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: '2rem',
              zIndex: 6
            }}
          >
            {e.emoji}
            <div style={{ position: 'absolute', bottom: '-5px', left: '10%', right: '10%', height: '4px', background: 'rgba(0,0,0,0.5)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${(e.hp / e.maxHp) * 100}%`, background: '#EF4444', borderRadius: '2px' }} />
            </div>
          </div>
        ))}

        {projectilesState.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              background: '#00D4FF',
              borderRadius: '50%',
              boxShadow: '0 0 8px #00D4FF',
              zIndex: 4
            }}
          />
        ))}
      </div>

      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🪸</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#10B981', marginBottom: '16px' }}>Defensor dos Corais</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px', lineHeight: 1.6 }}>
              O recife da <strong>Pedra da Risca do Meio</strong> (Fortaleza) está sendo atacado por espécies invasoras e poluição!<br/><br/>
              ✔️ <strong>Gaste energia</strong> (⚡) para posicionar garoupas.<br/>
              🛡️ <strong>As garoupas</strong> protegem o coral automaticamente.<br/>
              🦁 <strong>Cuidado:</strong> O Peixe-Leão é uma ameaça real no litoral cearense!
            </p>
            
            <div style={{ background: 'rgba(0,212,255,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(0,212,255,0.2)', textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#00D4FF', fontWeight: 700 }}>💡 Você sabia?</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
                A Pedra da Risca do Meio é a única Unidade de Conservação totalmente marinha do Ceará. Localizada a 18km de Fortaleza, possui águas tão claras que a visibilidade chega a 30 metros!
              </p>
            </div>

            <button className="btn-primary" onClick={startGame} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%' }}>
              Defender o Recife!
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🥀</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Recife Destruído</h1>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>Muitas ameaças conseguiram passar pelas suas defesas.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#10B981', margin: 0, lineHeight: 1 }}>{score}</p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={startGame} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RotateCcw size={18} /> Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'victory' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#FCD34D', marginBottom: '8px' }}>Vitória!</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px' }}>Você protegeu o recife perfeitamente alcançando 500 pontos!</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={startGame} style={{ flex: 1, padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <RotateCcw size={18} /> Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-52%, -50%) rotate(-2deg); }
          75% { transform: translate(-48%, -50%) rotate(2deg); }
        }
        .damaged {
          animation: damage-flash 0.5s infinite !important;
        }
        @keyframes damage-flash {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 20px rgba(16,185,129,0.5)); }
          50% { opacity: 0.6; filter: drop-shadow(0 0 30px rgba(239,68,68,0.8)) sepia(1) saturate(5) hue-rotate(-50deg); }
        }
      `}</style>
    </div>
  );
}
