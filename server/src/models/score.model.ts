import { ScoreEntry } from './types';
import { v4 as uuidv4 } from 'uuid';

let scores: ScoreEntry[] = [
  {
    id: uuidv4(),
    playerName: 'Marina Costa',
    gameId: 'fauna-001',
    gameName: 'Fauna Marinha',
    score: 950,
    maxScore: 1000,
    percentage: 95,
    timeSpent: 180,
    createdAt: new Date('2026-04-18'),
  },
  {
    id: uuidv4(),
    playerName: 'João Marinho',
    gameId: 'fauna-001',
    gameName: 'Fauna Marinha',
    score: 880,
    maxScore: 1000,
    percentage: 88,
    timeSpent: 210,
    createdAt: new Date('2026-04-17'),
  },
  {
    id: uuidv4(),
    playerName: 'Ana Oceano',
    gameId: 'flora-001',
    gameName: 'Flora Marinha',
    score: 920,
    maxScore: 1000,
    percentage: 92,
    timeSpent: 195,
    createdAt: new Date('2026-04-19'),
  },
  {
    id: uuidv4(),
    playerName: 'Pedro Coral',
    gameId: 'pollution-001',
    gameName: 'Poluição Oceânica',
    score: 870,
    maxScore: 1000,
    percentage: 87,
    timeSpent: 220,
    createdAt: new Date('2026-04-16'),
  },
  {
    id: uuidv4(),
    playerName: 'Beatriz Mar',
    gameId: 'flora-001',
    gameName: 'Flora Marinha',
    score: 840,
    maxScore: 1000,
    percentage: 84,
    timeSpent: 230,
    createdAt: new Date('2026-04-15'),
  },
  {
    id: uuidv4(),
    playerName: 'Carlos Onda',
    gameId: 'pollution-001',
    gameName: 'Poluição Oceânica',
    score: 800,
    maxScore: 1000,
    percentage: 80,
    timeSpent: 250,
    createdAt: new Date('2026-04-14'),
  },
];

export const ScoreModel = {
  getAll(): ScoreEntry[] {
    return scores.sort((a, b) => b.score - a.score);
  },

  getByGame(gameId: string): ScoreEntry[] {
    return scores
      .filter((s) => s.gameId === gameId)
      .sort((a, b) => b.score - a.score);
  },

  addScore(entry: Omit<ScoreEntry, 'id' | 'createdAt'>): ScoreEntry {
    const newEntry: ScoreEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date(),
    };
    scores.push(newEntry);
    return newEntry;
  },

  getTopN(n: number): ScoreEntry[] {
    return scores.sort((a, b) => b.score - a.score).slice(0, n);
  },
};
