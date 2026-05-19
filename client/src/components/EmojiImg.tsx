import { useState, type CSSProperties } from 'react';

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@v15.1.0/assets/svg';

export function emojiToUrl(emoji: string): string {
  const cps: string[] = [];
  for (let i = 0; i < emoji.length; ) {
    const cp = emoji.codePointAt(i)!;
    // O twemoji remove o FE0F em alguns casos, mas a regra geral é manter para sequências com ZWJ
    // Esta é uma aproximação que funciona para a maioria.
    if (cp !== 0xFE0F) { 
      cps.push(cp.toString(16));
    }
    i += cp > 0xFFFF ? 2 : 1;
  }
  return `${TWEMOJI_BASE}/${cps.join('-')}.svg`;
}

interface EmojiImgProps {
  emoji: string;
  size?: string;
  style?: CSSProperties;
  className?: string;
}

export default function EmojiImg({ emoji, size = '1em', style, className }: EmojiImgProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <span
        className={className}
        style={{
          fontSize: size,
          lineHeight: 1,
          display: 'inline-block',
          verticalAlign: 'middle',
          userSelect: 'none',
          ...style,
        }}
        role="img"
        aria-label={emoji}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={emojiToUrl(emoji)}
      alt={emoji}
      draggable={false}
      className={className}
      decoding="async"
      loading="lazy"
      onError={() => setImgFailed(true)}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
