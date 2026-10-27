import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIService } from '../services/aiService.js';
import { Feedback, mongoManager } from '../database/mongo.js';
import { AppError } from '../config/errorRegistry.js';

const ChatSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  message: z.string().min(1, 'message cannot be empty').max(2000, 'message exceeds 2000 characters'),
  route: z.string().optional(),
  errorCode: z.string().optional(),
});

const FeedbackSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
  rating: z.enum(['helpful', 'not_helpful']),
  feedbackText: z.string().max(1000).optional(),
});

export class AssistantController {
  public static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = ChatSchema.parse(req.body);
      const userId = req.user?.id || 'anonymous';

      const response = await AIService.handleChat({
        conversationId: validated.conversationId,
        userId,
        message: validated.message,
        route: validated.route,
        errorCode: validated.errorCode,
      });

      res.json({
        success: true,
        data: response,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = FeedbackSchema.parse(req.body);

      if (!mongoManager.isConnected) {
        // Return 503 per requirement: "If MongoDB is unavailable, handle the failure gracefully, log it, and inform the user when the relevant feature cannot be persisted. Never pretend that a message or feedback was successfully saved if the database operation failed."
        throw new AppError('503', 'Feedback persistence service (MongoDB) is temporarily offline. Your feedback could not be recorded.');
      }

      await Feedback.create({
        conversationId: validated.conversationId,
        messageId: validated.messageId,
        rating: validated.rating,
        feedbackText: validated.feedbackText || '',
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Feedback successfully recorded. Thank you for helping us improve!',
      });
    } catch (err) {
      next(err);
    }
  }
}
