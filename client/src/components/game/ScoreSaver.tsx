import { useState } from 'react';
import { Trophy, Loader, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scoreService } from '../../services/api';

type ScoreSaverProps = {
  gameId: string;
  score: number;
  timeSpent?: number;
};

export default function ScoreSaver({ gameId, score, timeSpent = 0 }: ScoreSaverProps) {
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedName = playerName.trim();
  const alreadySaved = savedRank !== null;

  const handleSave = async () => {
    if (!normalizedName || saving || alreadySaved) return;

    setSaving(true);
    setError(null);

    try {
      const saved = await scoreService.saveScore({
        playerName: normalizedName,
        gameId,
        score,
        timeSpent,
      });

      const board = await scoreService.getLeaderboardByGame(gameId);
      const rank = board.findIndex((entry) => entry.id === saved.id) + 1;
      setSavedRank(rank > 0 ? rank : null);
    } catch {
      setError('Não foi possível salvar sua pontuação. Verifique se este jogo está cadastrado no Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px',
        margin: '0 0 22px',
        textAlign: 'left',
        border: alreadySaved ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.08)',
        background: alreadySaved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {alreadySaved ? <CheckCircle size={20} color="#10B981" /> : <Trophy size={20} color="#F59E0B" />}
        <div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#E2E8F0', margin: 0 }}>
            {alreadySaved ? 'Pontuação salva!' : 'Salvar no ranking'}
          </p>
          <p style={{ color: '#64748B', fontSize: '0.78rem', margin: '2px 0 0' }}>
            Pontuação final: <strong style={{ color: '#E2E8F0' }}>{score}</strong> pts
          </p>
        </div>
      </div>

      {alreadySaved ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#10B981', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
            Seu rank neste jogo: #{savedRank}
          </span>
          <Link to="/leaderboard" style={{ color: '#00D4FF', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            Ver ranking global →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="Digite seu nome"
              maxLength={30}
              style={{
                flex: '1 1 180px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.25)',
                color: '#E2E8F0',
                outline: 'none',
                fontSize: '0.95rem',
              }}
            />
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!normalizedName || saving}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: !normalizedName || saving ? 0.6 : 1,
                cursor: !normalizedName || saving ? 'not-allowed' : 'pointer',
                flex: '0 0 auto',
              }}
            >
              {saving ? <Loader size={16} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Trophy size={16} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: '0.78rem', margin: '10px 0 0' }}>{error}</p>}
        </>
      )}
    </div>
  );
}
