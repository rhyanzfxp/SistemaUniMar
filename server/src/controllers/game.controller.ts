import { Request, Response } from 'express';
import { games, questions } from '../models/game.model';
import { ResponseView } from '../views/response.view';

export const GameController = {
  getAllGames(req: Request, res: Response): void {
    ResponseView.success(res, games, 'Games retrieved successfully');
  },

  getGameById(req: Request, res: Response): void {
    const { id } = req.params;
    const game = games.find((g) => g.id === id || g.slug === id);

    if (!game) {
      ResponseView.notFound(res, 'Game');
      return;
    }

    ResponseView.success(res, game, 'Game retrieved successfully');
  },

  getGameQuestions(req: Request, res: Response): void {
    const { id } = req.params;
    const game = games.find((g) => g.id === id || g.slug === id);

    if (!game) {
      ResponseView.notFound(res, 'Game');
      return;
    }

    const gameQuestions = questions.filter((q) => q.gameId === game.id);

    const sanitized = gameQuestions.map(({ ...q }) => ({
      id: q.id,
      gameId: q.gameId,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      points: q.points,
    }));

    ResponseView.success(res, sanitized, 'Questions retrieved');
  },

  checkAnswer(req: Request, res: Response): void {
    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      ResponseView.error(res, 'questionId and answer are required', 400);
      return;
    }

    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      ResponseView.notFound(res, 'Question');
      return;
    }

    const isCorrect = question.correctAnswer === answer;

    ResponseView.success(res, {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      points: isCorrect ? question.points : 0,
    });
  },
};
