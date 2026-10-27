import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RoomService } from '../services/roomService.js';
import { AppError } from '../config/errorRegistry.js';

const RoomCreateSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters'),
  description: z.string().optional(),
  plannedDurationMinutes: z.number().min(5).max(180).optional(),
  maxParticipants: z.number().min(2).max(50).optional(),
  isPrivate: z.boolean().optional(),
});

const SoloSessionSchema = z.object({
  durationMinutes: z.number().min(1).max(360),
});

export class RoomController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await RoomService.listRooms();
      res.json({
        success: true,
        data: rooms,
        total: rooms.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const room = await RoomService.getRoomByIdOrCode(id);
      res.json({
        success: true,
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You must be signed in to create a focus room.');
      }

      const validated = RoomCreateSchema.parse(req.body);
      const room = await RoomService.createRoom({
        ...validated,
        hostUserId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Focus room created successfully.',
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You must be signed in to join a focus room.');
      }

      const { id } = req.params;
      const room = await RoomService.joinRoom(id, req.user.id);

      res.json({
        success: true,
        message: 'Joined focus room.',
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async action(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'Authentication required.');
      }

      const { id } = req.params;
      const { action } = req.body;

      if (!['start', 'pause', 'resume', 'complete'].includes(action)) {
        throw new AppError('400', "Invalid action. Supported: 'start', 'pause', 'resume', 'complete'");
      }

      const room = await RoomService.updateRoomStatus(id, action, req.user.id);

      res.json({
        success: true,
        message: `Focus session status changed to '${action}'.`,
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'Authentication required.');
      }

      const { id } = req.params;
      const result = await RoomService.checkIn(id, req.user.id);

      res.json({
        success: true,
        message: 'Check-in confirmed! Accountability bonus awarded.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logSoloSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'Authentication required.');
      }

      const validated = SoloSessionSchema.parse(req.body);
      const points = Math.round((validated.durationMinutes / 15) * 10);

      const result = await RoomService.logCompletedSession(
        req.user.id,
        validated.durationMinutes,
        null,
        points
      );

      res.json({
        success: true,
        message: `Logged ${validated.durationMinutes} focus minutes! +${points} points earned.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
