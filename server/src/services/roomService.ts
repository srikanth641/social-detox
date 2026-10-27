import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { AppError } from '../config/errorRegistry.js';

export interface FocusRoomState {
  id: string;
  code: string;
  name: string;
  description: string;
  hostUserId: string;
  hostName?: string;
  plannedDurationMinutes: number;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  startedAt: string | null;
  pausedAt: string | null;
  elapsedSeconds: number;
  remainingSeconds: number;
  maxParticipants: number;
  participantCount: number;
  isPrivate: boolean;
  participants: Array<{
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    checkinCount: number;
    status: string;
  }>;
}

export class RoomService {
  /**
   * Calculates the exact server-governed remaining seconds to prevent client-side drift
   */
  public static calculateTimer(room: any): { remainingSeconds: number; elapsedSeconds: number } {
    const totalSeconds = (room.planned_duration_minutes || 25) * 60;
    const elapsedBefore = room.elapsed_seconds_before_pause || 0;

    if (room.status === 'waiting') {
      return { remainingSeconds: totalSeconds, elapsedSeconds: 0 };
    }

    if (room.status === 'paused') {
      const remaining = Math.max(0, totalSeconds - elapsedBefore);
      return { remainingSeconds: remaining, elapsedSeconds: elapsedBefore };
    }

    if (room.status === 'completed') {
      return { remainingSeconds: 0, elapsedSeconds: totalSeconds };
    }

    if (room.status === 'active' && room.started_at) {
      const startedTime = new Date(room.started_at).getTime();
      const now = Date.now();
      const currentSpanSec = Math.max(0, Math.floor((now - startedTime) / 1000));
      const totalElapsed = elapsedBefore + currentSpanSec;
      const remaining = Math.max(0, totalSeconds - totalElapsed);

      return {
        remainingSeconds: remaining,
        elapsedSeconds: Math.min(totalSeconds, totalElapsed),
      };
    }

    return { remainingSeconds: totalSeconds, elapsedSeconds: 0 };
  }

  public static async listRooms(): Promise<FocusRoomState[]> {
    const roomsRes = await db.query(`
      SELECT r.*, u.display_name as host_name
      FROM focus_rooms r
      LEFT JOIN users u ON r.host_user_id = u.id
      ORDER BY r.created_at DESC
    `);

    const result: FocusRoomState[] = [];

    for (const r of roomsRes.rows) {
      const { remainingSeconds, elapsedSeconds } = this.calculateTimer(r);

      // Check auto-completion if timer has reached 0 while active
      if (r.status === 'active' && remainingSeconds === 0) {
        await db.query(`UPDATE focus_rooms SET status = 'completed' WHERE id = $1`, [r.id]);
        r.status = 'completed';
      }

      // Fetch participants
      const membersRes = await db.query(`
        SELECT rm.user_id, rm.checkin_count, rm.status, u.username, u.display_name, u.avatar_url
        FROM room_members rm
        JOIN users u ON rm.user_id = u.id
        WHERE rm.room_id = $1
      `, [r.id]);

      result.push({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description,
        hostUserId: r.host_user_id,
        hostName: r.host_name || 'Room Host',
        plannedDurationMinutes: r.planned_duration_minutes,
        status: r.status,
        startedAt: r.started_at,
        pausedAt: r.paused_at,
        elapsedSeconds,
        remainingSeconds,
        maxParticipants: r.max_participants,
        participantCount: membersRes.rows.length,
        isPrivate: Boolean(r.is_private),
        participants: membersRes.rows.map(m => ({
          userId: m.user_id,
          username: m.username,
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
          checkinCount: m.checkin_count,
          status: m.status,
        })),
      });
    }

    return result;
  }

  public static async getRoomByIdOrCode(idOrCode: string): Promise<FocusRoomState> {
    const roomRes = await db.query(`
      SELECT r.*, u.display_name as host_name
      FROM focus_rooms r
      LEFT JOIN users u ON r.host_user_id = u.id
      WHERE r.id = $1 OR r.code = $1
    `, [idOrCode]);

    if (roomRes.rows.length === 0) {
      throw new AppError('404', `Focus room '${idOrCode}' not found.`);
    }

    const r = roomRes.rows[0];
    const { remainingSeconds, elapsedSeconds } = this.calculateTimer(r);

    if (r.status === 'active' && remainingSeconds === 0) {
      await db.query(`UPDATE focus_rooms SET status = 'completed' WHERE id = $1`, [r.id]);
      r.status = 'completed';
    }

    const membersRes = await db.query(`
      SELECT rm.user_id, rm.checkin_count, rm.status, u.username, u.display_name, u.avatar_url
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = $1
    `, [r.id]);

    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      hostUserId: r.host_user_id,
      hostName: r.host_name || 'Host',
      plannedDurationMinutes: r.planned_duration_minutes,
      status: r.status,
      startedAt: r.started_at,
      pausedAt: r.paused_at,
      elapsedSeconds,
      remainingSeconds,
      maxParticipants: r.max_participants,
      participantCount: membersRes.rows.length,
      isPrivate: Boolean(r.is_private),
      participants: membersRes.rows.map(m => ({
        userId: m.user_id,
        username: m.username,
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
        checkinCount: m.checkin_count,
        status: m.status,
      })),
    };
  }

  public static async createRoom(data: {
    name: string;
    description?: string;
    hostUserId: string;
    plannedDurationMinutes?: number;
    maxParticipants?: number;
    isPrivate?: boolean;
  }): Promise<FocusRoomState> {
    if (!data.name || data.name.trim().length < 3) {
      throw new AppError('400', 'Room name must be at least 3 characters.');
    }

    const id = uuidv4();
    const cleanName = data.name.trim();
    const duration = data.plannedDurationMinutes || 25;
    const maxP = data.maxParticipants || 10;
    const isPriv = data.isPrivate || false;

    // Generate room code e.g. FOCUS-847
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `${cleanName.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, 'RM')}-${randomSuffix}`;

    await db.query(`
      INSERT INTO focus_rooms (id, code, name, description, host_user_id, planned_duration_minutes, max_participants, is_private)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, code, cleanName, data.description || '', data.hostUserId, duration, maxP, isPriv]);

    // Host automatically joins room
    const memberId = uuidv4();
    await db.query(`
      INSERT INTO room_members (id, room_id, user_id, checkin_count, status)
      VALUES ($1, $2, $3, 1, 'active')
    `, [memberId, id, data.hostUserId]);

    return this.getRoomByIdOrCode(id);
  }

  public static async joinRoom(roomId: string, userId: string): Promise<FocusRoomState> {
    const room = await this.getRoomByIdOrCode(roomId);

    if (room.participants.length >= room.maxParticipants) {
      throw new AppError('400', 'This focus room has reached its maximum participant capacity.');
    }

    const alreadyJoined = room.participants.some(p => p.userId === userId);
    if (!alreadyJoined) {
      const memberId = uuidv4();
      await db.query(`
        INSERT INTO room_members (id, room_id, user_id, checkin_count, status)
        VALUES ($1, $2, $3, 1, 'active')
      `, [memberId, room.id, userId]);
    }

    return this.getRoomByIdOrCode(room.id);
  }

  public static async updateRoomStatus(
    roomId: string,
    action: 'start' | 'pause' | 'resume' | 'complete',
    userId: string
  ): Promise<FocusRoomState> {
    const room = await this.getRoomByIdOrCode(roomId);

    if (room.hostUserId !== userId) {
      throw new AppError('403', 'Only the room host can start, pause, or finish the session.');
    }

    const nowIso = new Date().toISOString();

    if (action === 'start' || action === 'resume') {
      await db.query(`
        UPDATE focus_rooms
        SET status = 'active', started_at = $1, paused_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [nowIso, room.id]);
    } else if (action === 'pause') {
      const { elapsedSeconds } = this.calculateTimer(room);
      await db.query(`
        UPDATE focus_rooms
        SET status = 'paused', paused_at = $1, elapsed_seconds_before_pause = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [nowIso, elapsedSeconds, room.id]);
    } else if (action === 'complete') {
      await db.query(`
        UPDATE focus_rooms
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [room.id]);

      // Award completion points to all active members
      const points = Math.round((room.plannedDurationMinutes / 15) * 10);
      for (const p of room.participants) {
        await this.logCompletedSession(p.userId, room.plannedDurationMinutes, room.id, points);
      }
    }

    return this.getRoomByIdOrCode(room.id);
  }

  public static async checkIn(roomId: string, userId: string) {
    const memberRes = await db.query(`
      SELECT id, checkin_count FROM room_members WHERE room_id = $1 AND user_id = $2
    `, [roomId, userId]);

    if (memberRes.rows.length === 0) {
      throw new AppError('404', 'You are not an active member of this focus room.');
    }

    const newCount = (memberRes.rows[0].checkin_count || 0) + 1;
    await db.query(`
      UPDATE room_members
      SET checkin_count = $1, last_heartbeat_at = CURRENT_TIMESTAMP
      WHERE room_id = $2 AND user_id = $3
    `, [newCount, roomId, userId]);

    // Give 5 accountability bonus points
    await db.query(`UPDATE users SET points = points + 5 WHERE id = $1`, [userId]);

    return { success: true, checkinCount: newCount, bonusPoints: 5 };
  }

  public static async logCompletedSession(
    userId: string,
    durationMinutes: number,
    roomId: string | null = null,
    points: number = 20
  ) {
    const sessionId = uuidv4();
    await db.query(`
      INSERT INTO focus_sessions (id, user_id, room_id, session_type, duration_minutes, points_earned, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'completed')
    `, [sessionId, userId, roomId, roomId ? 'room' : 'solo', durationMinutes, points]);

    // Update user stats
    await db.query(`
      UPDATE users
      SET total_focus_minutes = total_focus_minutes + $1,
          points = points + $2,
          last_active_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [durationMinutes, points, userId]);

    // Check streak
    await this.evaluateUserStreak(userId);

    return { sessionId, pointsEarned: points };
  }

  private static async evaluateUserStreak(userId: string) {
    const userRes = await db.query(`
      SELECT streak_days, longest_streak, focus_goal_minutes_per_day
      FROM users WHERE id = $1
    `, [userId]);

    if (userRes.rows.length === 0) return;
    const u = userRes.rows[0];

    // Increment streak by 1 if not already updated today
    const newStreak = (u.streak_days || 0) + 1;
    const newLongest = Math.max(newStreak, u.longest_streak || 0);

    await db.query(`
      UPDATE users
      SET streak_days = $1, longest_streak = $2
      WHERE id = $3
    `, [newStreak, newLongest, userId]);
  }
}
