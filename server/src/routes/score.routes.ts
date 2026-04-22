import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';

const router = Router();

router.get('/leaderboard', ScoreController.getLeaderboard);

router.get('/leaderboard/:gameId', ScoreController.getLeaderboardByGame);

router.get('/stats', ScoreController.getStats);

router.post('/', ScoreController.saveScore);

export default router;
