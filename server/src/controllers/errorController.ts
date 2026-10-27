import { Request, Response, NextFunction } from 'express';
import { ERROR_REGISTRY, AppError } from '../config/errorRegistry.js';
import { db } from '../database/db.js';

export class ErrorController {
  public static async listErrorCodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Fetch from SQL database or registry
      const dbErrors = await db.query('SELECT code, title, category, explanation, causes, resolution_steps, is_retryable FROM error_codes');

      if (dbErrors.rows.length > 0) {
        const formatted = dbErrors.rows.map(r => ({
          code: r.code,
          title: r.title,
          category: r.category,
          explanation: r.explanation,
          causes: typeof r.causes === 'string' ? r.causes.split('\n') : r.causes,
          resolutionSteps: typeof r.resolution_steps === 'string' ? r.resolution_steps.split('\n') : r.resolution_steps,
          isRetryable: Boolean(r.is_retryable),
        }));

        return void res.json({
          success: true,
          data: formatted,
          total: formatted.length,
        });
      }

      // Fallback to error registry
      const codes = Object.values(ERROR_REGISTRY);
      res.json({
        success: true,
        data: codes,
        total: codes.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getErrorCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const upperCode = code.toUpperCase();

      const def = ERROR_REGISTRY[upperCode];
      if (!def) {
        throw new AppError('404', `Error code '${code}' is not documented in the registry.`);
      }

      res.json({
        success: true,
        data: def,
      });
    } catch (err) {
      next(err);
    }
  }
}
