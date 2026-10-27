export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  focusGoalMinutesPerDay: number;
  totalFocusMinutes: number;
  streakDays: number;
  longestStreak: number;
  points: number;
  achievements?: Achievement[];
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful_count: number;
  order_index: number;
}

export interface ErrorCodeDef {
  code: string;
  title: string;
  category: string;
  explanation: string;
  causes: string[];
  resolutionSteps: string[];
  isRetryable: boolean;
}

export interface FocusRoom {
  id: string;
  code: string;
  name: string;
  description: string;
  hostUserId: string;
  hostName: string;
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

export interface FriendCircle {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_name: string;
  invite_code: string;
  member_count: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_focus_minutes: number;
  target_days: number;
  reward_points: number;
  badge_icon: string;
  end_date: string;
  participant_count: number;
  userProgress?: {
    progress_minutes: number;
    is_completed: boolean;
  } | null;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  unlocked_at?: string;
}

export interface SupportTicket {
  id: string;
  reference: string;
  user_id?: string | null;
  contact_name: string;
  contact_email: string;
  category: string;
  subject: string;
  description: string;
  error_code?: string;
  conversation_reference?: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface MotivationQuote {
  quote: string;
  author: string;
  source: 'remote' | 'cache' | 'fallback';
  fetchedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    faqs?: { id: string; question: string }[];
    errorCode?: string;
  };
  suggestTicket?: boolean;
  feedbackGiven?: 'helpful' | 'not_helpful' | null;
}
