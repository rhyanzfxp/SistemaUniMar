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

export interface GameQuestion {
  id: string;
  gameId: string;
  question: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string | number;
  explanation: string;
  points: number;
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
  createdAt: string;
}

export interface LeaderboardEntry extends ScoreEntry {
  rank: number;
}

export interface GameSession {
  gameId: string;
  questions: GameQuestion[];
  currentIndex: number;
  score: number;
  answers: Array<{ questionId: string; selectedAnswer: number; correct: boolean; points: number }>;
  startTime: number;
  finished: boolean;
}

export interface Stats {
  total: number;
  avgScore: number;
  byGame: Array<{
    gameId: string;
    gameName: string;
    totalPlays: number;
    avgScore: number;
    topScore: number;
  }>;
}
