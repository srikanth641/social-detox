import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 180, // limit each IP to 180 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const requestId = (req.headers['x-request-id'] as string) || 'rate-limited';
    res.status(429).json({
      success: false,
      error: {
        code: '429',
        message: 'Rate limit exceeded. Too many requests. Please slow down and try again in 60 seconds.',
        requestId,
      },
    });
  },
});

export const assistantRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 AI assistant requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const requestId = (req.headers['x-request-id'] as string) || 'assistant-rate-limited';
    res.status(429).json({
      success: false,
      error: {
        code: '429',
        message: 'You are sending assistant messages too quickly. Please wait 60 seconds before trying again.',
        requestId,
      },
    });
  },
});

export const ticketRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tickets per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const requestId = (req.headers['x-request-id'] as string) || 'ticket-rate-limited';
    res.status(429).json({
      success: false,
      error: {
        code: '429',
        message: 'Ticket submission rate limit exceeded. Please wait a few minutes before submitting another ticket.',
        requestId,
      },
    });
  },
});
