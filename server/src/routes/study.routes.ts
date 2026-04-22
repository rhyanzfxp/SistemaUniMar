import { Router } from 'express';
import { StudyController } from '../controllers/study.controller';

const router = Router();

router.get('/', StudyController.getAll);
router.get('/categories', StudyController.getCategories);
router.get('/:id', StudyController.getById);

export default router;
