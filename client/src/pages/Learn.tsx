import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Gamepad2, Loader, ChevronRight } from 'lucide-react';
import { studyService } from '../services/api';
import type { StudyCard } from '../models/study.types';

const categories = [
  { key: 'all', label: 'Todos', emoji: '🌊' },
  { key: 'fauna', label: 'Fauna Marinha', emoji: '🐠', color: '#00D4FF', gameSlug: 'fauna-marinha' },
  { key: 'flora', label: 'Flora Marinha', emoji: '🌿', color: '#10B981', gameSlug: 'flora-marinha' },
  { key: 'pollution', label: 'Poluição', emoji: '🗑️', color: '#F59E0B', gameSlug: 'poluicao-oceanica' },
  { key: 'ecosystem', label: 'Ecossistema', emoji: '🌿', color: '#10B981', gameSlug: 'ecossistema' },
];

const categoryMeta: Record<string, { color: string; glow: string; gameSlug: string }> = {
  fauna:     { color: '#00D4FF', glow: 'glow-cyan',   gameSlug: 'fauna-marinha' },
  flora:     { color: '#10B981', glow: 'glow-green',  gameSlug: 'flora-marinha' },
  pollution: { color: '#F59E0B', glow: 'glow-amber',  gameSlug: 'poluicao-oceanica' },
  ecosystem: { color: '#10B981', glow: 'glow-green',  gameSlug: 'ecossistema' },
};

function KnowledgeCard({ card }: { card: StudyCard }) {
  const [expanded, setExpanded] = useState(false);
  const meta = categoryMeta[card.category];

  return (
    <article
      className={`glass-card ${meta.glow}`}
      style={{
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
      }}
    >

      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          padding: '24px 28px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'left',
        }}
        aria-expanded={expanded}
        id={`card-btn-${card.id}`}
      >

        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: `${meta.color}18`,
            border: `1.5px solid ${meta.color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            flexShrink: 0,
          }}
        >
          {card.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#E2E8F0',
                margin: 0,
              }}
            >
              {card.title}
            </h3>
            {card.badge && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '99px',
                  background: `${meta.color}20`,
                  border: `1px solid ${meta.color}40`,
                  color: meta.color,
                  fontSize: '0.65rem',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.badge}
              </span>
            )}
          </div>
          <p
            style={{
              color: '#475569',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {card.subtitle}
          </p>
        </div>

        <div
          style={{
            color: meta.color,
            transition: 'transform 0.3s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 28px 28px',
            animation: 'slide-up 0.3s ease-out',
          }}
        >

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            {card.facts.map((fact) => (
              <div
                key={fact.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{fact.icon}</span>
                <div>
                  <p style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                    {fact.label}
                  </p>
                  <p style={{ color: '#E2E8F0', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                    {fact.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: `${meta.color}0C`,
              border: `1px solid ${meta.color}25`,
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: meta.color, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                Você sabia?
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                {card.didYouKnow}
              </p>
            </div>
          </div>

          <Link
            to={`/games/${card.relatedGameSlug ?? meta.gameSlug}`}
            style={{ textDecoration: 'none' }}
          >
            <button
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: card.relatedGameSlug === 'ecossistema'
                  ? 'linear-gradient(135deg, #10B981, #00D4FF)'
                  : undefined,
              }}
            >
              <Gamepad2 size={16} />
              {card.relatedGameSlug === 'ecossistema'
                ? 'Praticar no Ecossistema 🌿'
                : `Testar no Jogo de ${card.category === 'fauna' ? 'Fauna' : card.category === 'flora' ? 'Flora' : 'Poluição'}`}
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      )}
    </article>
  );
}

export default function Learn() {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [filtered, setFiltered] = useState<StudyCard[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    studyService
      .getAll()
      .then((data) => { setCards(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (key: string) => {
    setActiveCategory(key);
    if (key === 'all') {
      setFiltered(cards);
    } else if (key === 'ecosystem') {
      setFiltered(cards.filter((c) => c.relatedGameSlug === 'ecossistema'));
    } else {
      setFiltered(cards.filter((c) => c.category === key && c.relatedGameSlug !== 'ecossistema'));
    }
  };

  const catCounts = (key: string) => {
    if (key === 'all') return cards.length;
    if (key === 'ecosystem') return cards.filter((c) => c.relatedGameSlug === 'ecossistema').length;
    return cards.filter((c) => c.category === key && c.relatedGameSlug !== 'ecossistema').length;
  };

  return (
    <div style={{ padding: '60px 24px', maxWidth: '960px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <span className="badge-level">
          <BookOpen size={12} style={{ display: 'inline', marginRight: '6px' }} />
          Base de Conhecimento
        </span>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            margin: '16px 0 14px',
          }}
        >
          Aprenda Antes de{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #10B981, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Jogar
          </span>
        </h1>
        <p style={{ color: '#64748B', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
          Fichas científicas sobre fauna, flora e poluição dos mares cearenses.
          Clique num card para expandir e depois teste seu conhecimento nos jogos!
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '40px',
          alignItems: 'center',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleFilter(cat.key)}
            style={{
              padding: '9px 20px',
              borderRadius: '99px',
              border: `1px solid ${
                activeCategory === cat.key
                  ? cat.color ? `${cat.color}50` : 'rgba(0,212,255,0.4)'
                  : 'rgba(255,255,255,0.1)'
              }`,
              background:
                activeCategory === cat.key
                  ? cat.color ? `${cat.color}15` : 'rgba(0,212,255,0.1)'
                  : 'transparent',
              color:
                activeCategory === cat.key
                  ? cat.color || '#00D4FF'
                  : '#64748B',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
            <span
              style={{
                background: activeCategory === cat.key ? (cat.color || '#00D4FF') + '25' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat.key ? (cat.color || '#00D4FF') : '#475569',
                borderRadius: '99px',
                padding: '1px 7px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {catCounts(cat.key)}
            </span>
          </button>
        ))}

        <button
          onClick={() => setExpandAll((e) => !e)}
          style={{
            marginLeft: 'auto',
            padding: '9px 18px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: '#475569',
            fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          title="Expandir/recolher todos os cards"
        >
          {expandAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expandAll ? 'Recolher tudo' : 'Expandir tudo'}
        </button>
      </div>

      {!loading && (
        <div
          className="glass-card"
          style={{
            padding: '16px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.85rem', margin: '0 0 6px', color: '#94A3B8' }}>
              📚 {filtered.length} fichas disponíveis
              {activeCategory !== 'all' && ` · ${categories.find((c) => c.key === activeCategory)?.label}`}
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
              <div
                className="progress-bar"
                style={{ height: '100%', width: `${(filtered.length / Math.max(cards.length, 1)) * 100}%` }}
              />
            </div>
          </div>
          <Link to="/games">
            <button
              className="btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Gamepad2 size={14} /> Ir para os Jogos
            </button>
          </Link>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', gap: '12px', color: '#00D4FF' }}>
          <Loader size={24} style={{ animation: 'spin-slow 1s linear infinite' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>Carregando fichas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          Nenhuma ficha encontrada nesta categoria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((card) => (
            <ExpandableCardWrapper key={card.id} forceExpand={expandAll}>
              <KnowledgeCard card={card} />
            </ExpandableCardWrapper>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '60px', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 10px' }}>
            Pronto para o desafio?
          </h2>
          <p style={{ color: '#64748B', marginBottom: '28px', fontSize: '0.95rem' }}>
            Agora que estudou, teste seu conhecimento nos minijogos e entre no ranking!
          </p>
          <Link to="/games">
            <button
              className="btn-primary"
              style={{
                padding: '14px 36px',
                borderRadius: '12px',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Gamepad2 size={18} /> Jogar Agora
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ExpandableCardWrapper({
  children,
  forceExpand,
}: {
  children: React.ReactNode;
  forceExpand: boolean;
}) {

  return <div key={String(forceExpand)}>{children}</div>;
}
