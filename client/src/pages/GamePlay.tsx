import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Trophy, ArrowLeft, Loader } from 'lucide-react';
import { gameService, scoreService } from '../services/api';
import type { Game, GameQuestion, AnswerResult, GameSession } from '../models/types';
import { useSound } from '../context/SoundContext';

const categoryColors: Record<string, string> = {
  fauna: '#00D4FF',
  flora: '#10B981',
  pollution: '#F59E0B',
};

type GamePhase = 'loading' | 'playing' | 'result' | 'save' | 'error';

export default function GamePlay() {
  const { slug } = useParams<{ slug: string }>();
  const { playCorrect, playWrong, playFanfare, playTick } = useSound();

  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [session, setSession] = useState<GameSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickedRef = useRef(false); 

  useEffect(() => {
    if (!slug) return;
    Promise.all([gameService.getById(slug), gameService.getQuestions(slug)])
      .then(([g, q]) => {
        setGame(g);
        setQuestions(q);
        setSession({
          gameId: g.id,
          questions: q,
          currentIndex: 0,
          score: 0,
          answers: [],
          startTime: Date.now(),
          finished: false,
        });
        setTimeLeft(g.timeLimit);
        setPhase('playing');
      })
      .catch(() => setPhase('error'));
  }, [slug]);

  const currentQuestion = session ? session.questions[session.currentIndex] : null;

  useEffect(() => {
    if (phase !== 'playing' || selectedAnswer !== null) return;
    tickedRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;

        if (next > 0 && next <= 10 && !tickedRef.current) {
          tickedRef.current = false; 
          playTick();
        }
        if (next <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, session?.currentIndex, selectedAnswer]);

  useEffect(() => {
    if (phase === 'playing' && selectedAnswer === null && timeLeft > 0 && timeLeft <= 10) {
      playTick();
    }
  }, [timeLeft]);

  const handleTimeout = useCallback(() => {
    if (!currentQuestion || selectedAnswer !== null) return;
    setSelectedAnswer(-1);
    gameService
      .checkAnswer(currentQuestion.id, -1)
      .then((result) => {
        setAnswerResult(result);
        playWrong();
        setSession((prev) =>
          prev
            ? {
                ...prev,
                answers: [
                  ...prev.answers,
                  { questionId: currentQuestion.id, selectedAnswer: -1, correct: false, points: 0 },
                ],
              }
            : prev
        );
      });
  }, [currentQuestion, selectedAnswer]);

  const handleSelectAnswer = async (idx: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    clearInterval(timerRef.current!);
    setSelectedAnswer(idx);

    const result = await gameService.checkAnswer(currentQuestion.id, idx);
    setAnswerResult(result);

    if (result.isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }

    const bonus = result.isCorrect
      ? Math.round((timeLeft / (game?.timeLimit || 30)) * currentQuestion.points * 0.2)
      : 0;
    const earnedPoints = result.points + bonus;

    setSession((prev) =>
      prev
        ? {
            ...prev,
            score: prev.score + earnedPoints,
            answers: [
              ...prev.answers,
              { questionId: currentQuestion.id, selectedAnswer: idx, correct: result.isCorrect, points: earnedPoints },
            ],
          }
        : prev
    );
  };

  const handleNext = () => {
    if (!session || !game) return;
    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      setSession((prev) => (prev ? { ...prev, finished: true } : prev));
      playFanfare();
      setPhase('result');
    } else {
      setSession((prev) => (prev ? { ...prev, currentIndex: nextIndex } : prev));
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(game.timeLimit);
    }
  };

  const handleSaveScore = async () => {
    if (!session || !game || !playerName.trim()) return;
    setSaving(true);
    try {
      await scoreService.saveScore({
        playerName: playerName.trim(),
        gameId: game.id,
        score: session.score,
        timeSpent: Math.round((Date.now() - session.startTime) / 1000),
      });
      const board = await scoreService.getLeaderboardByGame(game.id);
      const myRank = board.findIndex((e) => e.playerName === playerName.trim()) + 1;
      setSavedRank(myRank);
      setPhase('save');
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const color = game ? (categoryColors[game.category] || '#00D4FF') : '#00D4FF';
  const percentage = session && game ? Math.round((session.score / game.maxScore) * 100) : 0;
  const correctCount = session?.answers.filter((a) => a.correct).length || 0;

  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '12px', color: '#00D4FF' }}>
        <Loader size={24} style={{ animation: 'spin-slow 1s linear infinite' }} />
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>Carregando...</span>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <p style={{ color: '#EF4444', fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>Erro ao carregar o jogo.</p>
        <Link to="/games"><button className="btn-secondary" style={{ padding: '10px 24px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowLeft size={16} /> Voltar</button></Link>
      </div>
    );
  }

  if (phase === 'result' && session && game) {
    const getGrade = () => {
      if (percentage >= 90) return { label: 'Guardião do Oceano!', emoji: '🏆', color: '#F59E0B' };
      if (percentage >= 70) return { label: 'Mergulhador Experiente!', emoji: '🐠', color: '#00D4FF' };
      if (percentage >= 50) return { label: 'Explorador em Treinamento', emoji: '🌊', color: '#10B981' };
      return { label: 'Continue Explorando!', emoji: '🌱', color: '#94A3B8' };
    };
    const grade = getGrade();

    return (
      <div style={{ padding: 'clamp(32px, 8vw, 60px) 16px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(3.5rem, 12vw, 5rem)', marginBottom: '16px', animation: 'scale-in 0.5s ease-out' }}>
          {grade.emoji}
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: grade.color, marginBottom: '8px' }}>
          {grade.label}
        </h1>
        <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '0.9rem' }}>{game.name} · Resultado Final</p>

        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 36px)', marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(3rem, 10vw, 4rem)', margin: '0 0 4px', background: `linear-gradient(135deg, ${color}, #7C3AED)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {session.score}
          </p>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0 0 20px' }}>de {game.maxScore} pontos · {percentage}%</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '8px', marginBottom: '20px', overflow: 'hidden' }}>
            <div className="progress-bar" style={{ height: '100%', width: `${percentage}%` }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Corretas', value: correctCount, color: '#10B981' },
              { label: 'Erradas', value: session.answers.length - correctCount, color: '#EF4444' },
              { label: 'Questões', value: session.questions.length, color },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 'clamp(16px, 4vw, 24px)', marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '12px' }}>🏅 Salvar no Ranking</p>
          <input
            type="text"
            placeholder="Seu apelido (ex: MarinheiroCearense)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={30}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#E2E8F0', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
              outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveScore()}
          />
          <button
            className="btn-primary"
            onClick={handleSaveScore}
            disabled={!playerName.trim() || saving}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', opacity: !playerName.trim() || saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {saving ? <Loader size={16} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Trophy size={16} />}
            {saving ? 'Salvando...' : 'Entrar no Ranking'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/games"><button className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><ArrowLeft size={16} /> Outros Jogos</button></Link>
          <button className="btn-primary" onClick={() => { setSession({ gameId: game.id, questions, currentIndex: 0, score: 0, answers: [], startTime: Date.now(), finished: false }); setSelectedAnswer(null); setAnswerResult(null); setTimeLeft(game.timeLimit); setPhase('playing'); }} style={{ padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            🔄 Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'save') {
    return (
      <div style={{ padding: 'clamp(40px, 10vw, 60px) 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(3.5rem, 12vw, 5rem)', marginBottom: '16px', animation: 'scale-in 0.5s ease-out' }}>🎉</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '8px' }}>Pontuação Salva!</h1>
        {savedRank && (
          <p style={{ color: '#00D4FF', fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
            Você ficou em #{savedRank} no ranking de {game?.name}!
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
          <Link to="/leaderboard"><button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={16} /> Ver Ranking</button></Link>
          <Link to="/games"><button className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '10px' }}>Jogar Outro</button></Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !session || !game) return null;

  const timerPct = (timeLeft / game.timeLimit) * 100;
  const timerColor = timerPct > 50 ? '#10B981' : timerPct > 25 ? '#F59E0B' : '#EF4444';
  const isUrgent = timeLeft <= 10;

  return (
    <div style={{ padding: 'clamp(20px, 5vw, 40px) 16px', maxWidth: '760px', margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '8px' }}>
        <Link to="/games">
          <button className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Sair
          </button>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{game.icon}</span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color, fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>{game.name}</span>
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', color }}>
          {session.score} pts
        </div>
      </div>

      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569' }}>
        <span>Questão {session.currentIndex + 1}/{session.questions.length}</span>
        <span>{correctCount} corretas</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '5px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(session.currentIndex / session.questions.length) * 100}%`, background: `linear-gradient(90deg, ${color}, #7C3AED)`, borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>

      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderColor: isUrgent ? 'rgba(239,68,68,0.3)' : undefined,
          animation: isUrgent ? 'pulse-glow 0.5s ease-in-out infinite' : undefined,
        }}
      >
        <Clock size={16} color={timerColor} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '7px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: '99px', transition: 'width 1s linear, background 0.3s' }} />
        </div>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: timerColor, minWidth: '28px', textAlign: 'right', fontSize: '0.95rem' }}>
          {timeLeft}s
        </span>
      </div>

      <div className="glass-card" style={{ padding: 'clamp(18px, 4vw, 28px)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span className="badge-level" style={{ marginTop: '2px', flexShrink: 0 }}>
            {currentQuestion.difficulty === 'easy' ? '⬡ Fácil' : currentQuestion.difficulty === 'medium' ? '⬡ Médio' : '⬡ Difícil'}
          </span>
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', margin: '12px 0 0', lineHeight: 1.5 }}>
          {currentQuestion.question}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {currentQuestion.options?.map((opt, idx) => {
          let extraClass = '';
          if (selectedAnswer !== null && answerResult) {
            if (idx === answerResult.correctAnswer) extraClass = 'correct';
            else if (idx === selectedAnswer && !answerResult.isCorrect) extraClass = 'wrong';
          }
          return (
            <button
              key={idx}
              id={`answer-option-${idx}`}
              onClick={() => handleSelectAnswer(idx)}
              disabled={selectedAnswer !== null}
              className={`option-btn ${extraClass}`}
              style={{ padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 20px)', borderRadius: '12px', fontSize: 'clamp(0.88rem, 2.5vw, 0.95rem)', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1.5px solid ${extraClass === 'correct' ? '#10B981' : extraClass === 'wrong' ? '#EF4444' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: extraClass === 'correct' ? '#10B981' : extraClass === 'wrong' ? '#EF4444' : '#475569', flexShrink: 0 }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
              {extraClass === 'correct' && <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />}
              {extraClass === 'wrong' && <XCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {answerResult && (
        <div style={{ animation: 'slide-up 0.4s ease-out' }}>
          <div
            className="glass-card"
            style={{
              padding: 'clamp(14px, 4vw, 20px)',
              marginBottom: '12px',
              borderColor: answerResult.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              {answerResult.isCorrect
                ? <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                : <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />}
              <div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: answerResult.isCorrect ? '#10B981' : '#EF4444', margin: '0 0 6px', fontSize: '0.9rem' }}>
                  {answerResult.isCorrect ? `+${answerResult.points} pontos! ` : selectedAnswer === -1 ? 'Tempo esgotado!' : 'Resposta errada.'}
                </p>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
                  {answerResult.explanation}
                </p>
              </div>
            </div>
          </div>

          <button
            id="next-question-btn"
            className="btn-primary"
            onClick={handleNext}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {session.currentIndex + 1 >= session.questions.length ? '🏁 Ver Resultado' : 'Próxima Questão →'}
          </button>
        </div>
      )}
    </div>
  );
}
