import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { AppError } from '../config/errorRegistry.js';

export interface CreateTicketDTO {
  userId?: string | null;
  contactName?: string;
  contactEmail: string;
  category: string;
  subject: string;
  description: string;
  errorCode?: string;
  conversationReference?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class TicketService {
  /**
   * Generates a collision-safe human-readable ticket reference e.g. SD-2026-00042
   */
  public static async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SD-${year}-`;

    const countRes = await db.query(
      `SELECT COUNT(*) as count FROM support_tickets WHERE reference LIKE $1`,
      [`${prefix}%`]
    );

    const nextIndex = (parseInt(countRes.rows[0]?.count || '0', 10) + 1);
    const padded = String(nextIndex).padStart(5, '0');
    let candidate = `${prefix}${padded}`;

    // Verify collision safety
    const exists = await db.query(`SELECT id FROM support_tickets WHERE reference = $1`, [candidate]);
    if (exists.rows.length > 0) {
      // Append random 2-digit entropy if collision occurs
      const entropy = Math.floor(10 + Math.random() * 90);
      candidate = `${prefix}${padded}-${entropy}`;
    }

    return candidate;
  }

  public static async createTicket(dto: CreateTicketDTO) {
    if (!dto.contactEmail || !dto.contactEmail.includes('@')) {
      throw new AppError('400', 'A valid contact email is required.');
    }
    if (!dto.subject || dto.subject.trim().length < 3) {
      throw new AppError('400', 'Subject must be at least 3 characters.');
    }
    if (!dto.description || dto.description.trim().length < 10) {
      throw new AppError('400', 'Description must be at least 10 characters.');
    }

    const id = uuidv4();
    const reference = await this.generateReference();
    const priority = dto.priority || 'medium';
    const status = 'open';
    const contactName = dto.contactName?.trim() || 'Guest User';
    const category = dto.category?.trim() || 'General Inquiry';
    const errorCode = dto.errorCode?.trim() || '';
    const convRef = dto.conversationReference?.trim() || '';

    await db.query(
      `INSERT INTO support_tickets 
       (id, reference, user_id, contact_name, contact_email, category, subject, description, error_code, conversation_reference, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        reference,
        dto.userId || null,
        contactName,
        dto.contactEmail.trim(),
        category,
        dto.subject.trim(),
        dto.description.trim(),
        errorCode,
        convRef,
        status,
        priority,
      ]
    );

    return {
      id,
      reference,
      status,
      category,
      subject: dto.subject,
      contactEmail: dto.contactEmail,
      createdAt: new Date().toISOString(),
    };
  }

  public static async getTicketByReference(reference: string, requestingUserId?: string) {
    const res = await db.query(
      `SELECT id, reference, user_id, contact_name, contact_email, category, subject, description,
              error_code, status, priority, created_at, updated_at
       FROM support_tickets
       WHERE reference = $1`,
      [reference]
    );

    if (res.rows.length === 0) {
      throw new AppError('404', `Support ticket '${reference}' was not found.`);
    }

    const ticket = res.rows[0];

    // Ownership check: If ticket belongs to a specific user and requester is logged in as someone else
    if (ticket.user_id && requestingUserId && ticket.user_id !== requestingUserId) {
      throw new AppError('403', 'You do not have permission to view this ticket.');
    }

    return ticket;
  }

  public static async getUserTickets(userId: string) {
    const res = await db.query(
      `SELECT id, reference, category, subject, error_code, status, priority, created_at, updated_at
       FROM support_tickets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  }
}
