export interface GameQuestion {
  id: string;
  gameId: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  maxScore: number;
  questionCount: number;
  timeLimit: number; 
  category: 'fauna' | 'flora' | 'pollution' | 'ecosystem';
}

export interface ScoreEntry {
  id: string;
  playerName: string;
  gameId: string;
  gameName: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number; 
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  gameName: string;
  percentage: number;
  createdAt: Date;
}
