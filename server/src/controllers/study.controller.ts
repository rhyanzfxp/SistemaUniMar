import { Request, Response } from 'express';
import { StudyModel } from '../models/study.model';
import { ResponseView } from '../views/response.view';

export const StudyController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const cards = category
        ? await StudyModel.getByCategory(category as string)
        : await StudyModel.getAll();
      ResponseView.success(res, cards, 'Study cards retrieved');
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch study cards');
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const card = await StudyModel.getById(req.params.id);
      if (!card) {
        ResponseView.notFound(res, 'Study card');
        return;
      }
      ResponseView.success(res, card);
    } catch (error) {
      ResponseView.error(res, 'Failed to fetch study card');
    }
  },

  getCategories(_req: Request, res: Response): void {
    ResponseView.success(res, StudyModel.getCategories());
  },
};
