import { Request, Response } from 'express';
import { GameModel } from '../models/game.model';
import { ResponseView } from '../views/response.view';

export const GameController = {
  async getAllGames(req: Request, res: Response): Promise<void> {
    try {
      const games = await GameModel.getAll();
      ResponseView.success(res, games, 'Games retrieved successfully');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch games');
    }
  },

  async getGameById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const game = await GameModel.getById(id);

      if (!game) {
        ResponseView.notFound(res, 'Game');
        return;
      }

      ResponseView.success(res, game, 'Game retrieved successfully');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch game');
    }
  },

  async getGameQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const game = await GameModel.getById(id);

      if (!game) {
        ResponseView.notFound(res, 'Game');
        return;
      }

      const gameQuestions = await GameModel.getQuestions(game.id);

      const sanitized = gameQuestions.map((q) => ({
        id: q.id,
        gameId: q.gameId,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points,
      }));

      ResponseView.success(res, sanitized, 'Questions retrieved');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch questions');
    }
  },

  async checkAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { questionId, answer } = req.body;

      if (!questionId || answer === undefined) {
        ResponseView.error(res, 'questionId and answer are required', 400);
        return;
      }

      const question = await GameModel.getQuestionById(questionId);

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
    } catch (error) {
      ResponseView.error(res, 'Failed to check answer');
    }
  },
};
