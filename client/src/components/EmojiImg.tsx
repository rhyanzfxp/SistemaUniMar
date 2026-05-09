import type { CSSProperties } from 'react';



const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@v15.1.0/assets/svg';


export function emojiToUrl(emoji: string): string {
  const cps: string[] = [];
  for (let i = 0; i < emoji.length; ) {
    const cp = emoji.codePointAt(i)!;
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
  return (
    <img
      src={emojiToUrl(emoji)}
      alt={emoji}
      draggable={false}
      className={className}
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
