-- Social Detox Database Schema
-- Compatible with PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT 'Ready to trade scrolling for living.',
    focus_goal_minutes_per_day INTEGER DEFAULT 120,
    total_focus_minutes INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_codes (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    explanation TEXT NOT NULL,
    causes TEXT NOT NULL,
    resolution_steps TEXT NOT NULL,
    is_retryable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS focus_rooms (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    host_user_id TEXT NOT NULL,
    planned_duration_minutes INTEGER DEFAULT 25,
    status TEXT DEFAULT 'waiting', -- waiting, active, paused, completed
    started_at TIMESTAMP NULL,
    paused_at TIMESTAMP NULL,
    elapsed_seconds_before_pause INTEGER DEFAULT 0,
    ends_at TIMESTAMP NULL,
    max_participants INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_members (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checkin_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, completed, left
    FOREIGN KEY (room_id) REFERENCES focus_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    room_id TEXT NULL,
    session_type TEXT DEFAULT 'solo', -- solo, room
    duration_minutes INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed', -- in_progress, completed, abandoned
    check_ins_count INTEGER DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES focus_rooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS friend_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    creator_id TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member', -- admin, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES friend_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_focus_minutes INTEGER NOT NULL,
    target_days INTEGER DEFAULT 7,
    reward_points INTEGER DEFAULT 150,
    badge_icon TEXT DEFAULT 'target',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenge_participants (
    id TEXT PRIMARY KEY,
    challenge_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    progress_minutes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER DEFAULT 50,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    user_id TEXT NULL,
    contact_name TEXT DEFAULT 'Guest User',
    contact_email TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    error_code TEXT DEFAULT '',
    conversation_reference TEXT DEFAULT '',
    status TEXT DEFAULT 'open', -- open, in_progress, resolved
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for high-performance queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_streak ON users(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_focus_rooms_code ON focus_rooms(code);
CREATE INDEX IF NOT EXISTS idx_focus_rooms_status ON focus_rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ref ON support_tickets(reference);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
