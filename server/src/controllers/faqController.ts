import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db.js';
import { AppError } from '../config/errorRegistry.js';

export class FAQController {
  public static async listFAQs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string;
      let sql = 'SELECT id, category, question, answer, helpful_count, order_index FROM faqs WHERE is_active = TRUE';
      const params: any[] = [];

      if (category && category !== 'all') {
        sql += ' AND category = $1';
        params.push(category);
      }

      sql += ' ORDER BY order_index ASC, created_at ASC';

      const result = await db.query(sql, params);
      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getFAQById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT id, category, question, answer, helpful_count, order_index FROM faqs WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('404', `FAQ with id '${id}' was not found.`);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }

  public static async searchFAQs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string || '').trim().toLowerCase();
      if (!query) {
        return FAQController.listFAQs(req, res, next);
      }

      const searchPattern = `%${query}%`;
      const result = await db.query(
        `SELECT id, category, question, answer, helpful_count, order_index 
         FROM faqs 
         WHERE is_active = TRUE AND (LOWER(question) LIKE $1 OR LOWER(answer) LIKE $2)
         ORDER BY order_index ASC`,
        [searchPattern, searchPattern]
      );

      res.json({
        success: true,
        query,
        data: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
