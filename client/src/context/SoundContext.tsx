import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

function createAudioCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  startTime: number,
  duration: number,
  gainPeak: number,
  freqEnd?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function soundCorrect(ctx: AudioContext) {
  const t = ctx.currentTime;
  playTone(ctx, 'sine', 523, t, 0.15, 0.4);          
  playTone(ctx, 'sine', 659, t + 0.10, 0.20, 0.35);  
  playTone(ctx, 'sine', 784, t + 0.20, 0.30, 0.3);   
}

function soundWrong(ctx: AudioContext) {
  const t = ctx.currentTime;
  playTone(ctx, 'sawtooth', 220, t, 0.12, 0.3, 110);
  playTone(ctx, 'sawtooth', 180, t + 0.10, 0.20, 0.2, 90);
}

function soundFanfare(ctx: AudioContext) {
  const notes = [523, 659, 784, 1047]; 
  notes.forEach((freq, i) => {
    playTone(ctx, 'sine', freq, ctx.currentTime + i * 0.12, 0.25, 0.4);
  });

  [523, 659, 784].forEach((f) => {
    playTone(ctx, 'sine', f, ctx.currentTime + 0.55, 0.6, 0.25);
  });
}

function soundTick(ctx: AudioContext) {
  const t = ctx.currentTime;
  playTone(ctx, 'square', 880, t, 0.06, 0.15);
}

interface SoundContextType {
  muted: boolean;
  toggleMute: () => void;
  playCorrect: () => void;
  playWrong: () => void;
  playFanfare: () => void;
  playTick: () => void;
}

const SoundContext = createContext<SoundContextType>({
  muted: false,
  toggleMute: () => {},
  playCorrect: () => {},
  playWrong: () => {},
  playFanfare: () => {},
  playTick: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = createAudioCtx();

    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback((fn: (ctx: AudioContext) => void) => {
    if (muted) return;
    const ctx = getCtx();
    if (ctx) fn(ctx);
  }, [muted, getCtx]);

  const playCorrect = useCallback(() => play(soundCorrect), [play]);
  const playWrong   = useCallback(() => play(soundWrong),   [play]);
  const playFanfare = useCallback(() => play(soundFanfare), [play]);
  const playTick    = useCallback(() => play(soundTick),    [play]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playCorrect, playWrong, playFanfare, playTick }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
