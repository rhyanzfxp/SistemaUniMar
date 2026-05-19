import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Heart, Zap } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import EmojiImg from '../components/EmojiImg';
import ScoreSaver from '../components/game/ScoreSaver';

type Enemy = { id: number; x: number; y: number; speed: number; hp: number; maxHp: number; emoji: string };
type Projectile = { id: number; x: number; y: number; targetId: number; dx: number; dy: number; damage: number; color: string };
type TowerType = 'basic' | 'sniper' | 'healer';
type Tower = { id: number; spotIndex: number; lastFireTime: number; angle: number; flip: boolean; type: TowerType };

const CENTER_X = 50;
const CENTER_Y = 50;
const TOWER_SPOTS = [
  { x: 50, y: 35 }, { x: 65, y: 50 }, { x: 50, y: 65 }, { x: 35, y: 50 },
  { x: 60, y: 40 }, { x: 60, y: 60 }, { x: 40, y: 60 }, { x: 40, y: 40 },
];

const TOWER_INFO = {
  basic:  { cost: 40, emoji: '🐟', range: 35, damage: 1, cooldown: 1200, name: 'Atirador', projColor: '#00D4FF' },
  sniper: { cost: 100, emoji: '🐡', range: 65, damage: 3, cooldown: 2500, name: 'Sniper', projColor: '#F59E0B' },
  healer: { cost: 150, emoji: '🐢', range: 0, damage: 0, cooldown: 4000, name: 'Curandeiro', projColor: '' }
};

export default function CoralDefenderGame() {
  const { playCorrect, playWrong, playFanfare } = useSound();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [energy, setEnergy] = useState(50);
  const [coralHp, setCoralHp] = useState(100);
  const [score, setScore] = useState(0);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType>('basic');
  
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

    const spawnRate = Math.max(500, 2500 - st.score * 8);
    if (now - st.lastEnemySpawn > spawnRate) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60;
      const x = CENTER_X + Math.cos(angle) * dist;
      const y = CENTER_Y + Math.sin(angle) * dist;
      
      const isTrash = Math.random() > 0.6;
      const hp = isTrash ? 2 : 3 + Math.floor(st.score / 150);
      
      st.enemies.push({
        id: st.nextEnemyId++,
        x, y,
        speed: 0.12 + Math.random() * 0.08 + (st.score / 2500),
        hp, maxHp: hp,
        emoji: isTrash ? '🛢️' : '🦁'
      });
      st.lastEnemySpawn = now;
    }

    st.towers.forEach(tower => {
      const info = TOWER_INFO[tower.type];
      if (now - tower.lastFireTime > info.cooldown) {
        if (tower.type === 'healer') {
          if (st.coralHp < 100) {
            st.coralHp = Math.min(100, st.coralHp + 5);
            setCoralHp(st.coralHp);
            tower.lastFireTime = now;
          }
        } else {
          let closest = null;
          let minDist = info.range;
          const spot = TOWER_SPOTS[tower.spotIndex];

          st.enemies.forEach(e => {
            const d = Math.hypot(e.x - spot.x, e.y - spot.y);
            if (d < minDist) { minDist = d; closest = e; }
          });

          if (closest) {
            const angle = Math.atan2((closest as Enemy).y - spot.y, (closest as Enemy).x - spot.x);
            
            const deg = angle * (180 / Math.PI);
            if (deg > 90 || deg < -90) {
              tower.angle = deg + 180;
              tower.flip = false;
            } else {
              tower.angle = deg;
              tower.flip = true;
            }
            
            st.projectiles.push({
              id: st.nextProjId++,
              x: spot.x, y: spot.y,
              targetId: (closest as Enemy).id,
              dx: Math.cos(angle) * 2.0,
              dy: Math.sin(angle) * 2.0,
              damage: info.damage,
              color: info.projColor
            });
            tower.lastFireTime = now;
          }
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
        target.hp -= p.damage;
        hit = true;
        if (target.hp <= 0) {
          st.score += 10;
          setScore(st.score);
          
          st.energy = Math.min(300, st.energy + 15);
          setEnergy(st.energy);
          
          playCorrect();
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
    if (gameState !== 'playing') return;
    const info = TOWER_INFO[selectedTowerType];
    if (energy < info.cost) return;
    
    // Se já tem torre, remove ela e devolve metade da energia? (Opcional, mas não vamos complicar)
    if (towers.some(t => t.spotIndex === spotIndex)) return;
    
    setEnergy(e => e - info.cost);
    setTowers(prev => {
      const newTowers = [...prev, { id: stateRef.current.nextTowerId++, spotIndex, lastFireTime: 0, angle: 0, flip: false, type: selectedTowerType }];
      stateRef.current.towers = newTowers;
      return newTowers;
    });
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)', backgroundColor: '#064E3B', overflow: 'hidden' }}>
      {/* Melhoria visual no fundo */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #0284C7 0%, #064E3B 100%)', opacity: 0.9 }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '99px', display: 'flex', gap: '6px', alignItems: 'center', color: '#10B981', fontWeight: 800, fontSize: '0.9rem' }}>
            <Heart size={16} fill="#10B981" /> {Math.max(0, coralHp)}%
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '99px', display: 'flex', gap: '6px', alignItems: 'center', color: '#FCD34D', fontWeight: 800, fontSize: '0.9rem' }}>
            <Zap size={16} fill="#FCD34D" /> {energy}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#FFF', fontSize: '1.1rem', background: 'rgba(0,0,0,0.4)', padding: '6px 16px', borderRadius: '99px' }}>
            {score} pts
          </div>
        </div>
      </div>

      {gameState === 'playing' && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 15, display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          {(Object.keys(TOWER_INFO) as TowerType[]).map(type => {
            const info = TOWER_INFO[type];
            const canAfford = energy >= info.cost;
            const isSelected = selectedTowerType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedTowerType(type)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '8px 12px', borderRadius: '12px', border: `2px solid ${isSelected ? '#10B981' : 'transparent'}`,
                  background: isSelected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                  cursor: 'pointer', opacity: canAfford ? 1 : 0.5, transition: 'all 0.2s'
                }}
              >
                <EmojiImg emoji={info.emoji} size="1.8rem" />
                <span style={{ color: '#E2E8F0', fontSize: '0.7rem', fontWeight: 700 }}>{info.name}</span>
                <span style={{ color: '#FCD34D', fontSize: '0.75rem', fontWeight: 800 }}>{info.cost}⚡</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Constraints for mobile responsiveness */}
      <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', bottom: '100px', width: '100%', maxWidth: '800px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(100%, 100vh - 200px)', aspectRatio: '1/1' }}>
          
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
            <EmojiImg emoji="🪸" size="6rem" />
          </div>

          {TOWER_SPOTS.map((spot, i) => {
            const tower = towers.find(t => t.spotIndex === i);
            const isAffordable = energy >= TOWER_INFO[selectedTowerType].cost;
            return (
              <div
                key={`spot-${i}`}
                onClick={() => placeTower(i)}
                style={{
                  position: 'absolute',
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 'min(12vw, 48px)',
                  height: 'min(12vw, 48px)',
                  borderRadius: '50%',
                  border: tower ? 'none' : '2px dashed rgba(255,255,255,0.3)',
                  background: tower ? 'transparent' : (isAffordable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: tower ? 'default' : (isAffordable ? 'pointer' : 'not-allowed'),
                  zIndex: 5
                }}
              >
                {tower && (
                  <div style={{ 
                    transition: 'transform 0.2s ease-out', 
                    transform: `rotate(${tower.angle}deg) scaleX(${tower.flip ? -1 : 1})`,
                  }}>
                    <EmojiImg emoji={TOWER_INFO[tower.type].emoji} size="min(8vw, 2.5rem)" />
                  </div>
                )}
              </div>
            );
          })}

          {enemiesState.map(e => {
            const angle = Math.atan2(CENTER_Y - e.y, CENTER_X - e.x) * (180 / Math.PI);
            let flip = false;
            let rot = angle;
            if (rot > 90 || rot < -90) { rot += 180; flip = true; }

            return (
              <div
                key={e.id}
                style={{
                  position: 'absolute',
                  left: `${e.x}%`,
                  top: `${e.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 6
                }}
              >
                <div style={{ transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})` }}>
                  <EmojiImg emoji={e.emoji} size="min(8vw, 2.5rem)" />
                </div>
                <div style={{ position: 'absolute', bottom: '-8px', left: '10%', right: '10%', height: '4px', background: 'rgba(0,0,0,0.5)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${(e.hp / e.maxHp) * 100}%`, background: '#EF4444', borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}

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
                background: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${p.color}`,
                zIndex: 4
              }}
            />
          ))}
        </div>
      </div>

      {gameState === 'start' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)', maxWidth: '500px', width: '90%', textAlign: 'center', margin: '20px' }}>
            <EmojiImg emoji="🪸" size="4rem" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: '#10B981', marginBottom: '16px' }}>Defensor dos Corais</h1>
            <p style={{ color: '#E2E8F0', marginBottom: '24px', lineHeight: 1.6, fontSize: '0.9rem' }}>
              O recife da <strong>Pedra da Risca do Meio</strong> (Fortaleza) está sendo atacado por poluição e o invasor Peixe-Leão!<br/><br/>
              ⚡ <strong>Gaste energia</strong> para posicionar aliados.<br/>
              🐠 <strong>Atirador:</strong> Básico e barato. <br/>
              🐡 <strong>Sniper:</strong> Dano alto e longo alcance. <br/>
              🐢 <strong>Curandeiro:</strong> Cura o coral periodicamente.<br/>
              Sobreviva o máximo que puder e bata seu recorde!
            </p>

            <button className="btn-primary" onClick={startGame} style={{ padding: '16px 32px', fontSize: '1.2rem', borderRadius: '12px', width: '100%' }}>
              Defender o Recife!
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
          <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)', maxWidth: '400px', width: '90%', textAlign: 'center', margin: '20px' }}>
            <EmojiImg emoji="🥀" size="4rem" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#EF4444', marginBottom: '8px' }}>Recife Destruído</h1>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>Muitas ameaças conseguiram passar pelas suas defesas.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
              <p style={{ color: '#E2E8F0', margin: '0 0 8px', fontSize: '1.1rem' }}>Pontuação Final</p>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '3.5rem', color: '#10B981', margin: 0, lineHeight: 1 }}>{score}</p>
            </div>

            <ScoreSaver gameId="coral-defender-001" score={score} />

            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
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
