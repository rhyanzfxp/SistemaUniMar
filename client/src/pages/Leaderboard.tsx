import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Loader, RefreshCw } from 'lucide-react';
import { scoreService, gameService } from '../services/api';
import type { LeaderboardEntry, Game } from '../models/types';

const medalColors = ['#F59E0B', '#94A3B8', '#CD7C0C'];
const MedalIcons = [Trophy, Medal, Award];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (gameId: string) => {
    try {
      const data =
        gameId === 'all'
          ? await scoreService.getLeaderboard(30)
          : await scoreService.getLeaderboardByGame(gameId);
      setEntries(data);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    Promise.all([gameService.getAll(), scoreService.getLeaderboard(30)])
      .then(([g, scores]) => { setGames(g); setEntries(scores); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGameFilter = async (gameId: string) => {
    setSelectedGame(gameId);
    setRefreshing(true);
    await fetchData(gameId);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(selectedGame);
    setRefreshing(false);
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return '#10B981';
    if (pct >= 60) return '#00D4FF';
    if (pct >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{ padding: 'clamp(32px, 8vw, 60px) 16px', maxWidth: '900px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge-level">Hall da Fama</span>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 6vw, 3.2rem)', margin: '16px 0 12px' }}>
          <span style={{ background: 'linear-gradient(135deg, #F59E0B, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ranking Global
          </span>
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Os guardiões do oceano que mais sabem sobre os mares cearenses.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGameFilter('all')}
            style={{
              padding: '8px 16px', borderRadius: '99px',
              border: `1px solid ${selectedGame === 'all' ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              background: selectedGame === 'all' ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: selectedGame === 'all' ? '#00D4FF' : '#64748B',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Todos
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGameFilter(g.id)}
              style={{
                padding: '8px 14px', borderRadius: '99px',
                border: `1px solid ${selectedGame === g.id ? `${g.color}50` : 'rgba(255,255,255,0.1)'}`,
                background: selectedGame === g.id ? `${g.color}15` : 'transparent',
                color: selectedGame === g.id ? g.color : '#64748B',
                fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {g.icon} {g.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: '#475569', cursor: 'pointer', fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin-slow 1s linear infinite' : 'none' }} />
          Atualizar
        </button>
      </div>

      {entries.length >= 3 && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '10px', marginBottom: '28px', alignItems: 'flex-end' }}>
          {[entries[1], entries[0], entries[2]].map((e, displayIdx) => {
            const actualRank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
            const IconComp = MedalIcons[actualRank - 1];
            const scale = actualRank === 1 ? 1 : 0.93;
            return (
              <div
                key={e.id}
                className="glass-card"
                style={{
                  padding: 'clamp(16px, 4vw, 24px) 12px',
                  textAlign: 'center',
                  transform: `scale(${scale})`,
                  borderColor: actualRank === 1 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)',
                  boxShadow: actualRank === 1 ? '0 0 30px rgba(245,158,11,0.2)' : 'none',
                }}
              >
                <IconComp size={24} color={medalColors[actualRank - 1]} style={{ marginBottom: '6px' }} />
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: medalColors[actualRank - 1], margin: '0 0 4px' }}>
                  #{actualRank}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(0.78rem, 2.5vw, 0.95rem)', color: '#E2E8F0', margin: '0 0 4px', wordBreak: 'break-word' }}>
                  {e.playerName}
                </p>
                <p style={{ color: '#475569', fontSize: '0.7rem', margin: '0 0 6px' }}>{e.gameName}</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: getPercentageColor(e.percentage), margin: 0 }}>
                  {e.score} <span style={{ fontSize: '0.65rem', color: '#475569' }}>pts</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '12px', color: '#00D4FF' }}>
          <Loader size={20} style={{ animation: 'spin-slow 1s linear infinite' }} />
          <span>Carregando ranking...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌊</div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#475569' }}>
            Ninguém jogou ainda. Seja o primeiro!
          </p>
        </div>
      ) : (
        <>

          <div className="glass-card leaderboard-table-wrap" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#', 'Jogador', 'Jogo', 'Pontos', '%'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isTop3 = entry.rank <= 3;
                  const RankIcon = isTop3 ? MedalIcons[entry.rank - 1] : null;
                  return (
                    <tr
                      key={entry.id}
                      className="leaderboard-row"
                      style={{
                        borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: isTop3 ? `${medalColors[entry.rank - 1]}08` : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px', width: '48px' }}>
                        {RankIcon ? <RankIcon size={16} color={medalColors[entry.rank - 1]} /> : (
                          <span style={{ color: '#334155', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>{entry.rank}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#E2E8F0', fontSize: '0.92rem' }}>{entry.playerName}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>{entry.gameName}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#E2E8F0', fontSize: '0.92rem' }}>{entry.score}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '99px', background: `${getPercentageColor(entry.percentage)}15`, color: getPercentageColor(entry.percentage), fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem' }}>
                          {entry.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="leaderboard-cards-mobile">
            {entries.map((entry) => {
              const isTop3 = entry.rank <= 3;
              const RankIcon = isTop3 ? MedalIcons[entry.rank - 1] : null;
              return (
                <div
                  key={entry.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    borderColor: isTop3 ? `${medalColors[entry.rank - 1]}30` : undefined,
                    background: isTop3 ? `${medalColors[entry.rank - 1]}06` : undefined,
                  }}
                >

                  <div style={{ width: '36px', textAlign: 'center', flexShrink: 0 }}>
                    {RankIcon ? <RankIcon size={20} color={medalColors[entry.rank - 1]} /> : (
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#475569', fontSize: '1rem' }}>#{entry.rank}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#E2E8F0', margin: '0 0 2px', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.playerName}
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{entry.gameName}</p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#E2E8F0', margin: '0 0 2px', fontSize: '0.95rem' }}>{entry.score} pts</p>
                    <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: '99px', background: `${getPercentageColor(entry.percentage)}15`, color: getPercentageColor(entry.percentage), fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem' }}>
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 600px) {
          .leaderboard-table-wrap { display: none !important; }
          .leaderboard-cards-mobile { display: block !important; }
        }
        .leaderboard-cards-mobile { display: none; }
      `}</style>
    </div>
  );
}
