import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { mongoManager } from '../database/mongo.js';
import { ENV } from '../config/env.js';
import { recentLogs } from '../middleware/requestLogger.js';

export class HealthController {
  public static async live(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  public static async ready(req: Request, res: Response): Promise<void> {
    let sqlHealthy = false;
    let sqlError: string | null = null;
    try {
      await db.query('SELECT 1');
      sqlHealthy = true;
    } catch (err: any) {
      sqlError = err.message;
    }

    const mongoStatus = mongoManager.getStatus();
    const isAiConfigured = Boolean(ENV.AI_API_KEY && ENV.AI_API_KEY !== 'your_ai_api_key_here');

    const isReady = sqlHealthy; // SQL is essential for core app

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        sqlDatabase: {
          status: sqlHealthy ? 'connected' : 'error',
          engine: db.engine,
          error: sqlError,
        },
        mongoDatabase: {
          status: mongoStatus.connected ? 'connected' : 'disconnected',
          configured: Boolean(ENV.MONGODB_URI),
          error: mongoStatus.error,
        },
        aiProvider: {
          configured: isAiConfigured,
          model: ENV.AI_MODEL,
          status: isAiConfigured ? 'available' : 'fallback-mode',
        },
        motivationApi: {
          status: 'available',
          endpoint: ENV.MOTIVATION_API_URL,
        },
      },
    });
  }

  public static async status(req: Request, res: Response): Promise<void> {
    let sqlHealthy = false;
    try {
      await db.query('SELECT 1');
      sqlHealthy = true;
    } catch {
      sqlHealthy = false;
    }

    const mongoStatus = mongoManager.getStatus();

    res.json({
      success: true,
      service: 'Social Detox API',
      version: '1.0.0',
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      health: {
        sqlDatabase: {
          engine: db.engine,
          healthy: sqlHealthy,
        },
        mongoDatabase: {
          connected: mongoStatus.connected,
          healthy: mongoStatus.connected,
        },
        aiProvider: {
          model: ENV.AI_MODEL,
          active: Boolean(ENV.AI_API_KEY && ENV.AI_API_KEY !== 'your_ai_api_key_here'),
        },
      },
      recentLogsCount: recentLogs.length,
    });
  }
}
