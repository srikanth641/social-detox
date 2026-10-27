import { Request, Response, NextFunction } from 'express';
import { motivationService } from '../services/motivationService.js';

export class MotivationController {
  public static async getMotivation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quote = await motivationService.getDailyMotivation();
      res.json({
        success: true,
        data: quote,
      });
    } catch (err) {
      next(err);
    }
  }
}
