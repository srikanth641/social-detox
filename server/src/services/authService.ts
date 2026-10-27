import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { ENV } from '../config/env.js';
import { AppError } from '../config/errorRegistry.js';
import { AuthUserPayload } from '../middleware/authMiddleware.js';

export class AuthService {
  public static async register(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [data.email.toLowerCase().trim(), data.username.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      throw new AppError('400', 'A user with that email or username already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const id = uuidv4();
    const displayName = data.displayName?.trim() || data.username.trim();

    await db.query(
      `INSERT INTO users (id, username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, data.username.toLowerCase().trim(), data.email.toLowerCase().trim(), passwordHash, displayName]
    );

    const payload: AuthUserPayload = {
      id,
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id,
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        displayName,
        totalFocusMinutes: 0,
        streakDays: 0,
        points: 0,
        focusGoalMinutesPerDay: 120,
      },
      token,
    };
  }

  public static async login(credentials: { emailOrUsername: string; password: string }) {
    const query = `
      SELECT id, username, email, password_hash, display_name, avatar_url, bio,
             focus_goal_minutes_per_day, total_focus_minutes, streak_days, longest_streak, points
      FROM users
      WHERE email = $1 OR username = $2
    `;
    const target = credentials.emailOrUsername.toLowerCase().trim();
    const result = await db.query(query, [target, target]);

    if (result.rows.length === 0) {
      throw new AppError('401', 'Invalid email/username or password.');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(credentials.password, user.password_hash);

    if (!isMatch) {
      throw new AppError('401', 'Invalid email/username or password.');
    }

    // Update last_active_at
    await db.query('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const payload: AuthUserPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        focusGoalMinutesPerDay: user.focus_goal_minutes_per_day,
        totalFocusMinutes: user.total_focus_minutes,
        streakDays: user.streak_days,
        longestStreak: user.longest_streak,
        points: user.points,
      },
      token,
    };
  }

  public static async getUserProfile(userId: string) {
    const userRes = await db.query(
      `SELECT id, username, email, display_name, avatar_url, bio,
              focus_goal_minutes_per_day, total_focus_minutes, streak_days, longest_streak, points,
              created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new AppError('404', 'User profile not found.');
    }

    const user = userRes.rows[0];

    // Fetch user achievements
    const achRes = await db.query(
      `SELECT a.id, a.code, a.title, a.description, a.icon, a.points, ua.unlocked_at
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    );

    return {
      ...user,
      achievements: achRes.rows,
    };
  }
}
