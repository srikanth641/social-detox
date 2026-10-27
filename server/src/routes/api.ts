import { Router, Request, Response } from 'express';
import { FAQController } from '../controllers/faqController.js';
import { ErrorController } from '../controllers/errorController.js';
import { AssistantController } from '../controllers/assistantController.js';
import { TicketController } from '../controllers/ticketController.js';
import { RoomController } from '../controllers/roomController.js';
import { FriendController } from '../controllers/friendController.js';
import { MotivationController } from '../controllers/motivationController.js';
import { HealthController } from '../controllers/healthController.js';
import { AuthController } from '../controllers/authController.js';
import { authenticateUser, optionalUser } from '../middleware/authMiddleware.js';
import { assistantRateLimiter, ticketRateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../config/errorRegistry.js';
import { recentLogs } from '../middleware/requestLogger.js';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateUser, AuthController.me);

// --- FAQ Routes ---
router.get('/faqs', FAQController.listFAQs);
router.get('/faqs/search', FAQController.searchFAQs);
router.get('/faqs/:id', FAQController.getFAQById);

// --- Error Code Reference Routes ---
router.get('/errors', ErrorController.listErrorCodes);
router.get('/errors/:code', ErrorController.getErrorCode);

// --- AI Assistant Routes ---
router.post('/assistant/chat', assistantRateLimiter, optionalUser, AssistantController.chat);
router.post('/assistant/feedback', AssistantController.submitFeedback);

// --- Support Ticket Routes ---
router.post('/tickets', ticketRateLimiter, optionalUser, TicketController.create);
router.get('/tickets/my', authenticateUser, TicketController.getMyTickets);
router.get('/tickets/:reference', optionalUser, TicketController.getByReference);

// --- Focus Room & Session Routes ---
router.get('/focus-rooms', RoomController.list);
router.get('/focus-rooms/:id', RoomController.getById);
router.post('/focus-rooms', authenticateUser, RoomController.create);
router.post('/focus-rooms/:id/join', authenticateUser, RoomController.join);
router.post('/focus-rooms/:id/action', authenticateUser, RoomController.action);
router.post('/focus-rooms/:id/check-in', authenticateUser, RoomController.checkIn);
router.post('/focus-sessions/solo', authenticateUser, RoomController.logSoloSession);

// --- Friends, Circles & Challenges Routes ---
router.get('/friends/leaderboard', FriendController.getLeaderboard);
router.get('/friends/circles', FriendController.listCircles);
router.post('/friends/circles', authenticateUser, FriendController.createCircle);
router.post('/friends/circles/join', authenticateUser, FriendController.joinCircle);
router.get('/friends/challenges', optionalUser, FriendController.listChallenges);
router.post('/friends/challenges/:id/join', authenticateUser, FriendController.joinChallenge);
router.get('/friends/achievements', FriendController.listAchievements);

// --- Third-Party Motivation API Route ---
router.get('/motivation', MotivationController.getMotivation);

// --- Health Check & Logging Operations ---
router.get('/health', HealthController.status);
router.get('/health/live', HealthController.live);
router.get('/health/ready', HealthController.ready);
router.get('/health/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: recentLogs.length,
    logs: recentLogs.slice(-50), // Last 50 requests
  });
});

// --- Test Error Route (for demonstration and test suites) ---
router.get('/test-error/:code', (req: Request, res: Response) => {
  const code = req.params.code;
  if (code === '500') {
    throw new Error('Explicit test error for 500 Internal Server Error demonstration.');
  }
  throw new AppError(code, `Test error triggered for code ${code}`);
});

export default router;
