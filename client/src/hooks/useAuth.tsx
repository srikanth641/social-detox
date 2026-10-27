import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('detox_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        displayName: data.display_name || data.displayName || data.username,
        avatarUrl: data.avatar_url || data.avatarUrl,
        bio: data.bio,
        focusGoalMinutesPerDay: data.focus_goal_minutes_per_day || data.focusGoalMinutesPerDay || 120,
        totalFocusMinutes: data.total_focus_minutes || data.totalFocusMinutes || 0,
        streakDays: data.streak_days || data.streakDays || 0,
        longestStreak: data.longest_streak || data.longestStreak || 0,
        points: data.points || 0,
        achievements: data.achievements || [],
      });
    } catch {
      localStorage.removeItem('detox_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await api.login({ emailOrUsername, password });
    localStorage.setItem('detox_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    const res = await api.register({ username, email, password, displayName });
    localStorage.setItem('detox_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const loginAsDemo = async () => {
    // Quick demo login using seeded demo user alex@detox.io / password123
    await login('alex@detox.io', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('detox_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginAsDemo, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
