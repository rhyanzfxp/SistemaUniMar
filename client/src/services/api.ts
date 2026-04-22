import axios from 'axios';
import type {
  Game,
  GameQuestion,
  AnswerResult,
  LeaderboardEntry,
  ScoreEntry,
  Stats,
} from '../models/types';
import type { StudyCard } from '../models/study.types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const gameService = {
  async getAll(): Promise<Game[]> {
    const { data } = await api.get('/games');
    return data.data;
  },

  async getById(id: string): Promise<Game> {
    const { data } = await api.get(`/games/${id}`);
    return data.data;
  },

  async getQuestions(gameId: string): Promise<GameQuestion[]> {
    const { data } = await api.get(`/games/${gameId}/questions`);
    return data.data;
  },

  async checkAnswer(
    questionId: string,
    answer: number
  ): Promise<AnswerResult> {
    const { data } = await api.post('/games/answer/check', {
      questionId,
      answer,
    });
    return data.data;
  },
};

export const scoreService = {
  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const { data } = await api.get('/scores/leaderboard', {
      params: { limit },
    });
    return data.data;
  },

  async getLeaderboardByGame(gameId: string): Promise<LeaderboardEntry[]> {
    const { data } = await api.get(`/scores/leaderboard/${gameId}`);
    return data.data;
  },

  async saveScore(entry: {
    playerName: string;
    gameId: string;
    score: number;
    timeSpent: number;
  }): Promise<ScoreEntry> {
    const { data } = await api.post('/scores', entry);
    return data.data;
  },

  async getStats(): Promise<Stats> {
    const { data } = await api.get('/scores/stats');
    return data.data;
  },
};

export const studyService = {
  async getAll(category?: string): Promise<StudyCard[]> {
    const { data } = await api.get('/study', { params: category ? { category } : {} });
    return data.data;
  },
  async getById(id: string): Promise<StudyCard> {
    const { data } = await api.get(`/study/${id}`);
    return data.data;
  },
};
