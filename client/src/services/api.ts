const BASE_URL = '/api/v1';

export class ApiError extends Error {
  public code: string;
  public details?: any;
  public requestId?: string;

  constructor(code: string, message: string, details?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('detox_token');
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errObj = data?.error;
    const code = errObj?.code || String(response.status);
    const message = errObj?.message || 'Request failed';
    throw new ApiError(code, message, errObj?.details, errObj?.requestId);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // FAQs
  getFaqs: (category?: string) => request<any[]>(`/faqs${category ? `?category=${category}` : ''}`),
  searchFaqs: (q: string) => request<any[]>(`/faqs/search?q=${encodeURIComponent(q)}`),
  getFaqById: (id: string) => request<any>(`/faqs/${id}`),

  // Error Codes
  getErrorCodes: () => request<any[]>('/errors'),
  getErrorCode: (code: string) => request<any>(`/errors/${code}`),

  // Assistant
  sendChatMessage: (payload: { conversationId: string; message: string; route?: string; errorCode?: string }) =>
    request<any>('/assistant/chat', { method: 'POST', body: JSON.stringify(payload) }),
  submitAssistantFeedback: (payload: { conversationId: string; messageId: string; rating: 'helpful' | 'not_helpful'; feedbackText?: string }) =>
    request<any>('/assistant/feedback', { method: 'POST', body: JSON.stringify(payload) }),

  // Support Tickets
  createTicket: (payload: any) => request<any>('/tickets', { method: 'POST', body: JSON.stringify(payload) }),
  getTicket: (ref: string) => request<any>(`/tickets/${ref}`),
  getMyTickets: () => request<any[]>('/tickets/my'),

  // Focus Rooms
  getRooms: () => request<any[]>('/focus-rooms'),
  getRoom: (id: string) => request<any>(`/focus-rooms/${id}`),
  createRoom: (payload: any) => request<any>('/focus-rooms', { method: 'POST', body: JSON.stringify(payload) }),
  joinRoom: (id: string) => request<any>(`/focus-rooms/${id}/join`, { method: 'POST' }),
  roomAction: (id: string, action: 'start' | 'pause' | 'resume' | 'complete') =>
    request<any>(`/focus-rooms/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) }),
  roomCheckIn: (id: string) => request<any>(`/focus-rooms/${id}/check-in`, { method: 'POST' }),
  logSoloSession: (durationMinutes: number) =>
    request<any>('/focus-sessions/solo', { method: 'POST', body: JSON.stringify({ durationMinutes }) }),

  // Friends & Challenges
  getLeaderboard: () => request<any[]>('/friends/leaderboard'),
  getCircles: () => request<any[]>('/friends/circles'),
  createCircle: (payload: { name: string; description?: string }) =>
    request<any>('/friends/circles', { method: 'POST', body: JSON.stringify(payload) }),
  joinCircle: (inviteCode: string) =>
    request<any>('/friends/circles/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  getChallenges: () => request<any[]>('/friends/challenges'),
  joinChallenge: (id: string) => request<any>(`/friends/challenges/${id}/join`, { method: 'POST' }),
  getAchievements: () => request<any[]>('/friends/achievements'),

  // Motivation API
  getMotivation: () => request<any>('/motivation'),

  // Health
  getHealthStatus: () => request<any>('/health'),
  getHealthReady: () => request<any>('/health/ready'),
  getHealthLogs: () => request<any>('/health/logs'),

  // Auth
  register: (payload: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request<any>('/auth/me'),
};
