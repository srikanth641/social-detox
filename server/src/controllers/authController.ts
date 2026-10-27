import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';
import { AppError } from '../config/errorRegistry.js';

const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().optional(),
});

const LoginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = RegisterSchema.parse(req.body);
      const result = await AuthService.register(validated);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Social Detox.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = await AuthService.login(validated);

      res.json({
        success: true,
        message: 'Signed in successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You are not logged in.');
      }

      const profile = await AuthService.getUserProfile(req.user.id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }
}
