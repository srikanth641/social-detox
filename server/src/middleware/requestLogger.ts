import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface StructuredLogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip?: string;
  userAgent?: string;
  error?: string;
}

// In-memory ring buffer of recent logs for health check inspection
export const recentLogs: StructuredLogEntry[] = [];
const MAX_LOG_BUFFER = 100;

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;

    // Filter out secrets, tokens, authorization headers
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status,
      durationMs,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown',
    };

    if (status >= 400 && (res.locals.errorMessage || res.locals.error)) {
      logEntry.error = res.locals.errorMessage || res.locals.error?.message;
    }

    recentLogs.push(logEntry);
    if (recentLogs.length > MAX_LOG_BUFFER) {
      recentLogs.shift();
    }

    const logColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${logColor}[${logEntry.timestamp}] [${requestId.substring(0, 8)}] ${req.method} ${logEntry.path} -> ${status} (${durationMs}ms)\x1b[0m`
    );
  });

  next();
}
