import { Router } from 'express';
import { GameController } from '../controllers/game.controller';

const router = Router();

router.get('/', GameController.getAllGames);

router.get('/:id', GameController.getGameById);

router.get('/:id/questions', GameController.getGameQuestions);

router.post('/answer/check', GameController.checkAnswer);

export default router;
