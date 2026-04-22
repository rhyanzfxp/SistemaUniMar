import { Request, Response } from 'express';
import { ScoreModel } from '../models/score.model';
import { games } from '../models/game.model';
import { ResponseView } from '../views/response.view';

export const ScoreController = {
  getLeaderboard(req: Request, res: Response): void {
    const limit = parseInt(req.query.limit as string) || 20;
    const gameId = req.query.gameId as string;

    const scores = gameId
      ? ScoreModel.getByGame(gameId)
      : ScoreModel.getTopN(limit);

    const ranked = scores.slice(0, limit).map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    ResponseView.success(res, ranked, 'Leaderboard retrieved');
  },

  getLeaderboardByGame(req: Request, res: Response): void {
    const { gameId } = req.params;
    const game = games.find((g) => g.id === gameId || g.slug === gameId);

    if (!game) {
      ResponseView.notFound(res, 'Game');
      return;
    }

    const scores = ScoreModel.getByGame(game.id);
    const ranked = scores.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    ResponseView.success(res, ranked, `Leaderboard for ${game.name}`);
  },

  saveScore(req: Request, res: Response): void {
    const { playerName, gameId, score, timeSpent } = req.body;

    if (!playerName || !gameId || score === undefined) {
      ResponseView.error(res, 'playerName, gameId and score are required', 400);
      return;
    }

    const game = games.find((g) => g.id === gameId || g.slug === gameId);

    if (!game) {
      ResponseView.notFound(res, 'Game');
      return;
    }

    const clampedScore = Math.max(0, Math.min(score, game.maxScore));
    const percentage = Math.round((clampedScore / game.maxScore) * 100);

    const entry = ScoreModel.addScore({
      playerName: playerName.trim().slice(0, 30),
      gameId: game.id,
      gameName: game.name,
      score: clampedScore,
      maxScore: game.maxScore,
      percentage,
      timeSpent: timeSpent || 0,
    });

    ResponseView.success(res, entry, 'Score saved successfully', 201);
  },

  getStats(req: Request, res: Response): void {
    const allScores = ScoreModel.getAll();
    const total = allScores.length;
    const avgScore =
      total > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / total)
        : 0;

    const byGame = games.map((g) => {
      const gameScores = ScoreModel.getByGame(g.id);
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
        topScore: gameScores[0]?.score || 0,
      };
    });

    ResponseView.success(res, { total, avgScore, byGame }, 'Stats retrieved');
  },
};
