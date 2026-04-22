import { Request, Response } from 'express';
import { StudyModel } from '../models/study.model';
import { ResponseView } from '../views/response.view';

export const StudyController = {
  getAll(req: Request, res: Response): void {
    const { category } = req.query;
    const cards = category
      ? StudyModel.getByCategory(category as string)
      : StudyModel.getAll();
    ResponseView.success(res, cards, 'Study cards retrieved');
  },

  getById(req: Request, res: Response): void {
    const card = StudyModel.getById(req.params.id);
    if (!card) { ResponseView.notFound(res, 'Study card'); return; }
    ResponseView.success(res, card);
  },

  getCategories(_req: Request, res: Response): void {
    ResponseView.success(res, StudyModel.getCategories());
  },
};
