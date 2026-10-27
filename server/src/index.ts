import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { db } from './database/db.js';
import { mongoManager } from './database/mongo.js';
import { runSeeds } from './database/seed.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import apiRouter from './routes/api.js';
import { setupRoomSocket } from './sockets/roomSocket.js';
import { AppError } from './config/errorRegistry.js';

export const app = express();
export const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
setupRoomSocket(io);

// Security & Standard Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Allow client scripts and styles in production
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Structured Request Logging
app.use(requestLogger);

// Global Rate Limiting for API routes
app.use('/api', globalRateLimiter);

// Mount Versioned API Routes
app.use('/api/v1', apiRouter);

// Catch-all 404 for undefined API endpoints
app.use('/api/*', (req, res, next) => {
  next(new AppError('404', `Endpoint '${req.originalUrl}' not found on this server.`));
});

// Serve Frontend static assets in unified/production build if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving frontend client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // If request has not been handled by API routes, serve index.html for SPA router
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central Error Handling Middleware
app.use(errorHandler);

// Server startup routine
async function bootstrap() {
  console.log(`[Server] Starting Social Detox Backend in '${ENV.NODE_ENV}' mode...`);

  // 1. Initialize SQL Database & ensure seeds
  try {
    await db.ensureReady();
    console.log(`[Server] SQL engine active: ${db.engine}`);
    // Check if FAQs table exists and has data; if not, seed
    const res = await db.query('SELECT COUNT(*) as count FROM faqs');
    if (parseInt(res.rows[0]?.count || '0', 10) === 0) {
      console.log('[Server] Seeding database with initial FAQs, error codes, and achievements...');
      await runSeeds();
    }
  } catch (err: any) {
    console.warn(`[Server] SQL check notice: ${err.message}. Attempting seed...`);
    try {
      await runSeeds();
    } catch (seedErr: any) {
      console.error('[Server] Seed error:', seedErr);
    }
  }

  // 2. Initialize MongoDB
  try {
    await mongoManager.init();
  } catch (mErr: any) {
    console.warn('[Server] MongoDB init notice:', mErr.message);
  }

  // 3. Start Listening
  server.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`[Server] 🚀 Social Detox server running on port ${ENV.PORT}`);
    console.log(`[Server] API root: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/v1/health`);
  });
}

// Handle graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server if not running inside test environment
if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
}
