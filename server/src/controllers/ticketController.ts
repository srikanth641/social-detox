import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TicketService } from '../services/ticketService.js';

const TicketCreateSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email('Please provide a valid email address'),
  category: z.string().min(2, 'Category must be selected'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Please describe your issue in at least 10 characters'),
  errorCode: z.string().optional(),
  conversationReference: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export class TicketController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = TicketCreateSchema.parse(req.body);
      const userId = req.user?.id || null;

      const ticket = await TicketService.createTicket({
        ...validated,
        userId,
      });

      res.status(201).json({
        success: true,
        message: `Support ticket ${ticket.reference} created successfully.`,
        data: ticket,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getByReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reference } = req.params;
      const requestingUserId = req.user?.id;

      const ticket = await TicketService.getTicketByReference(reference, requestingUserId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMyTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return void res.status(401).json({ success: false, error: { code: '401', message: 'Authentication required' } });
      }

      const tickets = await TicketService.getUserTickets(req.user.id);

      res.json({
        success: true,
        data: tickets,
        total: tickets.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
