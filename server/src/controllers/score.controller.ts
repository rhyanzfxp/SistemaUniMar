import { Request, Response } from 'express';
import { ScoreModel } from '../models/score.model';
import { GameModel } from '../models/game.model';
import { ResponseView } from '../views/response.view';

export const ScoreController = {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const gameId = req.query.gameId as string;

      const scores = gameId
        ? await ScoreModel.getByGame(gameId)
        : await ScoreModel.getTopN(limit);

      const ranked = scores.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

      ResponseView.success(res, ranked, 'Leaderboard retrieved');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch leaderboard');
    }
  },

  async getLeaderboardByGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const game = await GameModel.getById(gameId);

      if (!game) {
        ResponseView.notFound(res, 'Game');
        return;
      }

      const scores = await ScoreModel.getByGame(game.id);
      const ranked = scores.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

      ResponseView.success(res, ranked, `Leaderboard for ${game.name}`);
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch game leaderboard');
    }
  },

  async saveScore(req: Request, res: Response): Promise<void> {
    try {
      const { playerName, gameId, score, timeSpent } = req.body;

      if (!playerName || !gameId || score === undefined) {
        ResponseView.error(res, 'playerName, gameId and score are required', 400);
        return;
      }

      const game = await GameModel.getById(gameId);

      if (!game) {
        ResponseView.notFound(res, 'Game');
        return;
      }

      const clampedScore = Math.max(0, Math.min(score, game.maxScore));
      const percentage = Math.round((clampedScore / game.maxScore) * 100);

      const entry = await ScoreModel.addScore({
        playerName: playerName.trim().slice(0, 30),
        gameId: game.id,
        gameName: game.name,
        score: clampedScore,
        maxScore: game.maxScore,
        percentage,
        timeSpent: timeSpent || 0,
      });

      ResponseView.success(res, entry, 'Score saved successfully', 201);
    } catch (error) {
      ResponseView.error(res, 'Failed to save score');
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const allScores = await ScoreModel.getAll();
      const games = await GameModel.getAll();
      
      const total = allScores.length;
      const avgScore =
        total > 0
          ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / total)
          : 0;

      const byGame = games.map((g) => {
        const gameScores = allScores.filter(s => s.gameId === g.id);
        return {
          gameId: g.id,
          gameName: g.name,
          totalPlays: gameScores.length,
          avgScore:
            gameScores.length > 0
              ? Math.round(
                  gameScores.reduce((sum, s) => sum + s.score, 0) /
                    gameScores.length
                )
              : 0,
          topScore: gameScores.length > 0 ? Math.max(...gameScores.map(s => s.score)) : 0,
        };
      });

      ResponseView.success(res, { total, avgScore, byGame }, 'Stats retrieved');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch stats');
    }
  },
};
