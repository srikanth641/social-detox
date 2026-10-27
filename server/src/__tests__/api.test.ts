import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { db } from '../database/db.js';
import { runSeeds } from '../database/seed.js';

beforeAll(async () => {
  await db.ensureReady();
  await runSeeds();
});

describe('Social Detox Backend API Test Suite', () => {
  // 1. Health Checks
  describe('Health Checks & Operations', () => {
    it('GET /api/v1/health/live should return alive status and uptime', async () => {
      const res = await request(app).get('/api/v1/health/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('alive');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });

    it('GET /api/v1/health/ready should return service readiness', async () => {
      const res = await request(app).get('/api/v1/health/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body.services).toBeDefined();
      expect(res.body.services.sqlDatabase).toBeDefined();
    });

    it('GET /api/v1/health should return aggregated system health', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.service).toBe('Social Detox API');
    });
  });

  // 2. FAQs
  describe('PostgreSQL FAQ Endpoints', () => {
    it('GET /api/v1/faqs should return at least 10 seeded FAQs from database', async () => {
      const res = await request(app).get('/api/v1/faqs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });

    it('GET /api/v1/faqs/search should filter FAQs by keyword', async () => {
      const res = await request(app).get('/api/v1/faqs/search?q=timer');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].question.toLowerCase()).toContain('timer');
    });
  });

  // 3. Error Codes
  describe('Error Code Reference Endpoints', () => {
    it('GET /api/v1/errors should return all 8 required error codes', async () => {
      const res = await request(app).get('/api/v1/errors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const codes = res.body.data.map((e: any) => e.code);
      const requiredCodes = ['400', '401', '403', '404', '429', '500', '503', 'SD-001'];
      for (const reqCode of requiredCodes) {
        expect(codes).toContain(reqCode);
      }
    });

    it('GET /api/v1/errors/SD-001 should return focus session synchronization details', async () => {
      const res = await request(app).get('/api/v1/errors/SD-001');
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('SD-001');
      expect(res.body.data.title).toBe('Focus Session Synchronization Failed');
      expect(res.body.data.isRetryable).toBe(true);
    });
  });

  // 4. Motivation Third-Party API
  describe('Third-Party Motivation API', () => {
    it('GET /api/v1/motivation should return a quote with author and source', async () => {
      const res = await request(app).get('/api/v1/motivation');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.quote).toBe('string');
      expect(typeof res.body.data.author).toBe('string');
      expect(['remote', 'cache', 'fallback']).toContain(res.body.data.source);
    });
  });

  // 5. AI Assistant RAG & Error Explanation
  describe('AI Assistant & RAG Engine', () => {
    it('POST /api/v1/assistant/chat should explain error SD-001', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .send({
          conversationId: 'test-conv-001',
          message: 'Why did my focus room fail to synchronize with SD-001?',
          errorCode: 'SD-001',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('Synchronization Failed');
      expect(res.body.data.sources.errorCode).toBe('SD-001');
    });

    it('POST /api/v1/assistant/chat on unknown questions should offer support ticket creation', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .send({
          conversationId: 'test-conv-002',
          message: 'What is the quantum telemetry flux capacitor policy?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestTicket).toBe(true);
    });
  });

  // 6. Support Tickets
  describe('Support Ticket System', () => {
    let createdReference = '';

    it('POST /api/v1/tickets with invalid email should return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/tickets')
        .send({
          contactEmail: 'not-an-email',
          subject: 'Broken timer',
          description: 'This is a test description longer than 10 characters',
          category: 'Technical Issue',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('400');
    });

    it('POST /api/v1/tickets with valid payload should generate reference e.g. SD-2026-XXXXX', async () => {
      const res = await request(app)
        .post('/api/v1/tickets')
        .send({
          contactName: 'Test Student',
          contactEmail: 'student@college.edu',
          subject: 'Timer synchronization question',
          description: 'I need clarification on how the room timer recovers from sleep mode.',
          category: 'Timer Support',
          errorCode: 'SD-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toMatch(/^SD-\d{4}-\d{5}/);
      createdReference = res.body.data.reference;
    });

    it('GET /api/v1/tickets/:reference should retrieve the created ticket from SQL database', async () => {
      expect(createdReference).toBeTruthy();
      const res = await request(app).get(`/api/v1/tickets/${createdReference}`);
      expect(res.status).toBe(200);
      expect(res.body.data.reference).toBe(createdReference);
      expect(res.body.data.contact_email).toBe('student@college.edu');
    });
  });

  // 7. Error Handling & Custom Pages
  describe('Error Handling Middleware', () => {
    it('GET Nonexistent endpoint returns 404 Not Found', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('404');
    });

    it('GET /api/v1/test-error/400 returns 400 Bad Request', async () => {
      const res = await request(app).get('/api/v1/test-error/400');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('400');
    });

    it('GET /api/v1/test-error/401 returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/test-error/401');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('401');
    });

    it('GET /api/v1/test-error/403 returns 403 Forbidden', async () => {
      const res = await request(app).get('/api/v1/test-error/403');
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('403');
    });

    it('GET /api/v1/test-error/500 returns 500 Internal Server Error without leaking internal details', async () => {
      const res = await request(app).get('/api/v1/test-error/500');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('500');
      expect(res.body.error.requestId).toBeDefined();
    });
  });

  // 8. Focus Rooms & Leaderboard
  describe('Focus Rooms & Leaderboards', () => {
    it('GET /api/v1/focus-rooms should list rooms with server calculated remainingSeconds', async () => {
      const res = await request(app).get('/api/v1/focus-rooms');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const room = res.body.data[0];
      expect(typeof room.remainingSeconds).toBe('number');
      expect(room.status).toBeDefined();
    });

    it('GET /api/v1/friends/leaderboard should return consistency rankings', async () => {
      const res = await request(app).get('/api/v1/friends/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].consistency_score).toBeDefined();
    });
  });
});
