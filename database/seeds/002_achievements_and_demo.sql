-- Seed Required Achievements
INSERT INTO achievements (id, code, title, description, icon, points, requirement_type, requirement_value) VALUES
('ach-01', 'survived_45', 'Survived 45 minutes without checking group chat', 'Complete a single 45-minute continuous focus session without pausing or tabbing out.', 'message-square-off', 45, 'session_minutes', 45),
('ach-02', 'touch_grass', 'Touch Grass Champion', 'Log 180 total minutes of offline study or outdoor focus over a single weekend.', 'trees', 100, 'weekend_minutes', 180),
('ach-03', 'unlocked_focus', 'Focus Mode: Unlocked', 'Complete your very first synchronized focus session in a room or solo timer.', 'unlock', 25, 'first_session', 1),
('ach-04', 'notification_dodger', 'The Notification Dodger', 'Maintain a 5-day focus streak without resetting.', 'shield-alert', 75, 'streak_days', 5),
('ach-05', 'one_more_page', 'One More Page', 'Accumulate 10 completed focus sessions dedicated to reading or coursework.', 'book-open', 60, 'session_count', 10),
('ach-06', 'weekend_legend', 'Weekend Offline Legend', 'Complete at least 90 minutes of focus on both Saturday and Sunday in the same weekend.', 'trophy', 90, 'weekend_streak', 2)
ON CONFLICT(id) DO NOTHING;

-- Seed Demo Users (password_hash is bcrypt for 'password123': $2a$10$wK1q7e5x9p7J5n6q4w2p3.J0U4iE4v7M7j5m9v3b1a2c3d4e5f6g)
-- We will also handle user registration via authService
INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, bio, focus_goal_minutes_per_day, total_focus_minutes, streak_days, longest_streak, points) VALUES
('user-demo-01', 'alex_rivers', 'alex@detox.io', '$2a$10$i6H0bZ78x/vU0W6V48Zae.jU8kXF56Z8H9zQ6yA3tG1hL5vO1pB6u', 'Alex Rivers', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'CS Student @ State | Swapping TikTok scrolling for LeetCode & clean air.', 120, 1420, 7, 12, 640),
('user-demo-02', 'maya_lin', 'maya@detox.io', '$2a$10$i6H0bZ78x/vU0W6V48Zae.jU8kXF56Z8H9zQ6yA3tG1hL5vO1pB6u', 'Maya Lin', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', 'Bio pre-med grinding organic chemistry without Instagram.', 150, 1890, 11, 14, 910),
('user-demo-03', 'liam_chen', 'liam@detox.io', '$2a$10$i6H0bZ78x/vU0W6V48Zae.jU8kXF56Z8H9zQ6yA3tG1hL5vO1pB6u', 'Liam Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'Architecture major. Deep work mode > endless feed doomscrolling.', 90, 840, 4, 8, 380),
('user-demo-04', 'sofia_perez', 'sofia@detox.io', '$2a$10$i6H0bZ78x/vU0W6V48Zae.jU8kXF56Z8H9zQ6yA3tG1hL5vO1pB6u', 'Sofia Perez', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'Philosophy & Law. The mind is calmer when the screen stays dark.', 180, 2450, 15, 18, 1220)
ON CONFLICT(id) DO NOTHING;

-- Seed User Achievements for Demo User
INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES
('uach-01', 'user-demo-01', 'ach-01', CURRENT_TIMESTAMP),
('uach-02', 'user-demo-01', 'ach-03', CURRENT_TIMESTAMP),
('uach-03', 'user-demo-01', 'ach-04', CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

-- Seed Demo Focus Rooms
INSERT INTO focus_rooms (id, code, name, description, host_user_id, planned_duration_minutes, status, max_participants, is_private) VALUES
('room-01', 'STUDY-45', 'Late Night Algorithmic Deep Work', 'Focus room for data structures and backend coding. No distractions, lofi vibing.', 'user-demo-01', 45, 'waiting', 8, FALSE),
('room-02', 'MCAT-60', 'Pre-Med Deep Reading & Flashcards', 'Intense 60-minute silent study block for biology and organic chemistry students.', 'user-demo-02', 60, 'waiting', 12, FALSE),
('room-03', 'WRITE-25', 'Pomodoro Sprint: Thesis Drafting', '25-minute fast writing sprint. Get your thesis paragraph down!', 'user-demo-04', 25, 'waiting', 10, FALSE)
ON CONFLICT(id) DO NOTHING;

-- Seed Room Members
INSERT INTO room_members (id, room_id, user_id, checkin_count, status) VALUES
('rm-01', 'room-01', 'user-demo-01', 1, 'active'),
('rm-02', 'room-01', 'user-demo-03', 1, 'active'),
('rm-03', 'room-02', 'user-demo-02', 2, 'active'),
('rm-04', 'room-02', 'user-demo-04', 1, 'active')
ON CONFLICT(id) DO NOTHING;

-- Seed Friend Groups
INSERT INTO friend_groups (id, name, description, creator_id, invite_code) VALUES
('group-01', 'The Dopamine Detox Club', 'Campus circle committed to cutting down screen time by 50% this semester.', 'user-demo-01', 'DETOX-2026'),
('group-02', 'Midnight Coders Guild', 'No phone while the terminal is open. Focus sprints every evening.', 'user-demo-03', 'CODE-MID')
ON CONFLICT(id) DO NOTHING;

-- Seed Group Members
INSERT INTO group_members (id, group_id, user_id, role) VALUES
('gm-01', 'group-01', 'user-demo-01', 'admin'),
('gm-02', 'group-01', 'user-demo-02', 'member'),
('gm-03', 'group-01', 'user-demo-03', 'member'),
('gm-04', 'group-01', 'user-demo-04', 'member'),
('gm-05', 'group-02', 'user-demo-03', 'admin'),
('gm-06', 'group-02', 'user-demo-01', 'member')
ON CONFLICT(id) DO NOTHING;

-- Seed Shared Challenges
INSERT INTO challenges (id, title, description, target_focus_minutes, target_days, reward_points, badge_icon, end_date) VALUES
('chal-01', 'Spring Deep Work Sprint', 'Complete 600 minutes of focused studying this week without social media browsing.', 600, 7, 200, 'flame', CURRENT_TIMESTAMP + INTERVAL '7 days'),
('chal-02', 'Weekend Screen Sanctuary', 'Clock 3 hours of offline hobby, book reading, or coursework between Friday & Sunday.', 180, 3, 120, 'sun', CURRENT_TIMESTAMP + INTERVAL '5 days')
ON CONFLICT(id) DO NOTHING;

-- Seed Challenge Participants
INSERT INTO challenge_participants (id, challenge_id, user_id, progress_minutes, is_completed) VALUES
('cp-01', 'chal-01', 'user-demo-01', 420, FALSE),
('cp-02', 'chal-01', 'user-demo-02', 580, FALSE),
('cp-03', 'chal-01', 'user-demo-04', 600, TRUE)
ON CONFLICT(id) DO NOTHING;

-- Seed Sample Support Ticket for demonstration
INSERT INTO support_tickets (id, reference, user_id, contact_name, contact_email, category, subject, description, error_code, status, priority) VALUES
('tick-01', 'SD-2026-00001', 'user-demo-01', 'Alex Rivers', 'alex@detox.io', 'Technical Issue', 'Focus session lost sync during Wi-Fi switch', 'While moving from library 2nd floor to 1st floor, the Wi-Fi switched networks and the timer paused with SD-001 error. After clicking resync, it resumed smoothly.', 'SD-001', 'resolved', 'low')
ON CONFLICT(id) DO NOTHING;
