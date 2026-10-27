import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { AppError } from '../config/errorRegistry.js';

export class FriendController {
  public static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Score = (streak_days * 50) + points, rewarding consistency over bulk gaming
      const result = await db.query(`
        SELECT id, username, display_name, avatar_url, bio,
               streak_days, total_focus_minutes, points,
               ((streak_days * 50) + points) AS consistency_score
        FROM users
        ORDER BY consistency_score DESC, streak_days DESC
        LIMIT 25
      `);

      res.json({
        success: true,
        data: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listCircles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupsRes = await db.query(`
        SELECT g.*, u.display_name as creator_name,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM friend_groups g
        JOIN users u ON g.creator_id = u.id
        ORDER BY g.created_at DESC
      `);

      res.json({
        success: true,
        data: groupsRes.rows,
        total: groupsRes.rows.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createCircle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You must be signed in to create a circle.');
      }

      const { name, description } = req.body;
      if (!name || name.trim().length < 3) {
        throw new AppError('400', 'Circle name must be at least 3 characters.');
      }

      const id = uuidv4();
      const code = `CIRCLE-${Math.floor(1000 + Math.random() * 9000)}`;

      await db.query(`
        INSERT INTO friend_groups (id, name, description, creator_id, invite_code)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, name.trim(), description || '', req.user.id, code]);

      const memberId = uuidv4();
      await db.query(`
        INSERT INTO group_members (id, group_id, user_id, role)
        VALUES ($1, $2, $3, 'admin')
      `, [memberId, id, req.user.id]);

      res.status(201).json({
        success: true,
        message: 'Friend circle created successfully.',
        data: { id, name, inviteCode: code },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async joinCircle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You must be signed in to join a circle.');
      }

      const { inviteCode } = req.body;
      if (!inviteCode) {
        throw new AppError('400', 'Invite code is required.');
      }

      const groupRes = await db.query(`
        SELECT id, name FROM friend_groups WHERE UPPER(invite_code) = UPPER($1)
      `, [inviteCode.trim()]);

      if (groupRes.rows.length === 0) {
        throw new AppError('404', `No circle found with invite code '${inviteCode}'.`);
      }

      const group = groupRes.rows[0];

      // Check if already in group
      const checkRes = await db.query(`
        SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2
      `, [group.id, req.user.id]);

      if (checkRes.rows.length === 0) {
        const memberId = uuidv4();
        await db.query(`
          INSERT INTO group_members (id, group_id, user_id, role)
          VALUES ($1, $2, $3, 'member')
        `, [memberId, group.id, req.user.id]);
      }

      res.json({
        success: true,
        message: `Joined '${group.name}' successfully!`,
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const challengesRes = await db.query(`
        SELECT c.*,
               (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id) as participant_count
        FROM challenges c
        ORDER BY c.created_at DESC
      `);

      let userParticipations: Record<string, any> = {};
      if (userId) {
        const parts = await db.query(`
          SELECT challenge_id, progress_minutes, is_completed
          FROM challenge_participants
          WHERE user_id = $1
        `, [userId]);
        for (const p of parts.rows) {
          userParticipations[p.challenge_id] = p;
        }
      }

      const formatted = challengesRes.rows.map(c => ({
        ...c,
        userProgress: userParticipations[c.id] || null,
      }));

      res.json({
        success: true,
        data: formatted,
        total: formatted.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async joinChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('401', 'You must be signed in to join challenges.');
      }

      const { id } = req.params;
      const challengeRes = await db.query('SELECT id, title FROM challenges WHERE id = $1', [id]);
      if (challengeRes.rows.length === 0) {
        throw new AppError('404', 'Challenge not found.');
      }

      const partId = uuidv4();
      await db.query(`
        INSERT INTO challenge_participants (id, challenge_id, user_id, progress_minutes, is_completed)
        VALUES ($1, $2, $3, 0, FALSE)
        ON CONFLICT(challenge_id, user_id) DO NOTHING
      `, [partId, id, req.user.id]);

      res.json({
        success: true,
        message: `Joined challenge: ${challengeRes.rows[0].title}`,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achs = await db.query('SELECT * FROM achievements ORDER BY points ASC');
      res.json({
        success: true,
        data: achs.rows,
        total: achs.rows.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
