# Social Detox — Distraction to Connection

> **Tagline:** Make being offline the new flex.  
> **Final Software Development Capstone Assessment Project (2026)**  
> A premium, Gen Z-friendly social productivity platform that flips toxic algorithmic incentives: rewarding students and young creators for deep focus, shared study sprints, and meaningful offline connections.

---

## 1. Project Overview

**Social Detox** is a full-stack digital wellness platform engineered to reverse the dopamine-driven doomscroll cycle. Traditional social media platforms maximize screen time through infinite feeds, slot-machine notifications, and behavioral triggers. Social Detox does the opposite: it turns **intentional offline focus time, coursework sprints, and real-world connection** into your flex.

The application features:
- **Server-governed synchronized Focus Rooms** where students study together in real-time with zero timer drift.
- **Friend Circles & Squads** to foster healthy accountability without invasive spyware.
- **Weekly Consistency Leaderboard** that strictly rewards daily discipline over artificial idling.
- **Offline Achievement Badges** such as *“Touch Grass Champion”* and *“The Notification Dodger”*.
- **PostgreSQL-backed Knowledge Base & FAQ Center** with live semantic keyword search.
- **Comprehensive Error Code Reference** with interactive troubleshooting and live testing for all 8 required HTTP & site-specific codes (`SD-001`).
- **Grounded AI Assistant** available across all pages, combining PostgreSQL RAG retrieval, Gemini/OpenAI API generation, graceful offline fallback, and integrated support ticket creation.
- **Support Ticket Desk** with collision-safe reference generation (`SD-YYYY-XXXXX`).
- **Production Health Monitoring** featuring `/health`, `/api/v1/health/live`, `/api/v1/health/ready`, and structured request telemetry.

---

## 2. Problem Statement

College students and young knowledge workers lose 4–7 hours daily to unprompted social media scrolling. Existing screen time limiters are either:
1. **Paternalistic & Easily Bypassed:** Blockers that users disable within seconds.
2. **Invasive Spyware:** Screen recorders and keyloggers that violate student privacy.
3. **Isolating:** Productivity apps that ignore the powerful social aspect of peer accountability.

Social Detox solves this by harnessing positive peer accountability: studying with friends in synchronized rooms where staying focused earns consistency points and social recognition.

---

## 3. Main Features

- ⚡ **Synchronized Focus Rooms:** Master-clock governed study rooms (15, 25, 45, 60 mins). When the host starts or pauses, peer timers sync instantly via WebSockets with drift compensation.
- 🤝 **Friend Circles & Invite Codes:** Create campus study groups (e.g. `DETOX-2026`) and track squad progress.
- 🏆 **Consistency Leaderboards:** Ranked by `(Streak Days × 50) + Points`. Designed to reward daily habit formation rather than marathon gaming.
- 🎯 **Offline Milestone Badges:** Earn shareable achievement cards for completing distraction-free study blocks.
- 🤖 **Social Detox AI Assistant:** Floating chat widget on every page with RAG retrieval from PostgreSQL FAQs, automated error code diagnosis, helpfulness feedback, and support ticket creation.
- 🎫 **PostgreSQL Support Ticket System:** Human-readable reference codes (`SD-2026-00001`), validation, category routing, and ownership checks.
- 🛡️ **Comprehensive Error Diagnostics:** Documentation and test simulation for `400`, `401`, `403`, `404`, `429`, `500`, `503`, and platform code `SD-001`.
- 📊 **Daily Focus Motivation:** Daily wisdom from an external quote API with a strict 3-second timeout, in-memory caching, and resilient local fallback.

---

## 4. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS (Dark navy `#070A13` palette with violet, electric blue, cyan, and emerald accents)
- **Routing:** React Router v6 (with custom `/404` catch-all and `/500` demo pages)
- **Icons & Graphics:** Lucide React, Canvas-Confetti
- **Analytics Visuals:** Recharts for weekly consistency charting
- **Real-Time Client:** Socket.IO Client

### Backend
- **Runtime:** Node.js v24 (ES Modules)
- **Server Framework:** Express.js with TypeScript
- **WebSockets:** Socket.IO
- **Validation:** Zod Schema Validation
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Security:** Helmet, CORS, Express-Rate-Limit (separate tiers for global, assistant, and ticket endpoints)
- **Logging:** Custom structured request logger with unique Request IDs (`X-Request-Id`)

### Databases
- **Relational SQL Database:** PostgreSQL (production managed service via `pg.Pool` connection pool) with automatic local LibSQL/SQLite persistent disk storage (`social_detox.db`) fallback when running locally without a Docker or PostgreSQL instance.
- **Document Store:** MongoDB (via Mongoose) for assistant chat logs, helpfulness ratings, and interaction telemetry. Designed with graceful offline degradation.

---

## 5. Architecture Overview

```mermaid
flowchart TD
    Client["React Frontend (SPA + Tailwind + Lucide)"]
    Assistant["Social Detox Assistant (Floating Widget)"]
    Proxy["Vite Dev Proxy / Express Static Server"]
    Express["Express REST API (/api/v1) + Socket.IO"]
    Middleware["Security (Helmet, Rate Limiter, Logger, ErrorHandler)"]
    
    subgraph Storage ["Persistent Data Layer"]
        Postgres[("PostgreSQL Database\n(Users, FAQs, Errors, Rooms, Tickets)")]
        Mongo[("MongoDB Atlas\n(Chat Logs, Feedback, Telemetry)")]
    end

    subgraph External ["External Integrations"]
        GeminiAPI["Google Gemini 1.5 Flash API"]
        MotivationAPI["ZenQuotes Motivation API (3s Timeout)"]
    end

    Client --> Proxy
    Assistant --> Proxy
    Proxy --> Express
    Express --> Middleware
    Middleware --> Postgres
    Middleware --> Mongo
    Middleware --> GeminiAPI
    Middleware --> MotivationAPI
```

---

## 6. Screenshots & UI Progression

*Screenshots can be placed in `client/public/screenshots/` or attached to repository releases.*

1. **Landing Page:** Hero section with tagline *"Make Being Offline the New Flex"*, interactive timer preview, feature cards, and 3-step walkthrough.
2. **Study Dashboard:** Daily focus goal progress bar, weekly consistency chart (Recharts), solo quick-start timer, and motivational quote card.
3. **Synchronized Focus Rooms:** Real-time master countdown clock, host controls (start/pause/resume/complete), accountability check-ins, and peer list.
4. **Friends & Challenges:** Consistency leaderboard, squad circles, campus challenges, and shareable achievement trophies.
5. **Help Center & FAQ:** Searchable PostgreSQL accordion items with *"Ask Assistant Follow-up"* buttons.
6. **Error Code Reference:** 8 diagnostic cards with explanation, causes, steps, retryability flag, and live API test trigger.
7. **Custom 404 & 500 Pages:** Friendly copy, home/dashboard navigation, and pre-populated assistant prompts.
8. **System Health (`/health`):** Real-time service status indicators and live structured request telemetry table.

---

## 7. Local Installation Instructions

### Prerequisites
- **Node.js:** v18.0.0 or later (v20+ or v24 recommended)
- **Git:** installed and configured

### Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/your-username/social-detox.git
cd social-detox

# 2. Install root and package dependencies
npm install --prefix server
npm install --prefix client
```

---

## 8. Environment Variable Setup

Copy `.env.example` to `.env` in the root or `server/` directory:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/social_detox` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/social_detox` |
| `AI_API_KEY` | Google Gemini API Key | `AIzaSy...` (Optional, app has DB fallback) |
| `AI_MODEL` | AI Model Identifier | `gemini-1.5-flash` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for auth tokens | `your_secure_jwt_secret` |
| `MOTIVATION_API_URL` | Third-party quote endpoint | `https://zenquotes.io/api/today` |
| `LOG_LEVEL` | Logging verbosity | `info` |

*Note:* If `DATABASE_URL` is omitted, the app automatically initializes a persistent, disk-backed local SQL database at `database/social_detox.db`. If `MONGODB_URI` is omitted, the application runs gracefully without crashing and logs the offline status.

---

## 9. PostgreSQL Database Setup & Migrations

To run migrations and apply the relational schema:

```bash
# Execute initial schema migration
npm run migrate --prefix server
```

The migration creates 13 relational tables with foreign keys and indexes:
`users`, `faqs`, `error_codes`, `focus_rooms`, `focus_sessions`, `room_members`, `friend_groups`, `group_members`, `challenges`, `challenge_participants`, `achievements`, `user_achievements`, `support_tickets`.

---

## 10. MongoDB Setup

For chat logs and assistant feedback:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection URI: `mongodb+srv://user:pass@cluster.mongodb.net/social_detox?retryWrites=true&w=majority`.
3. Set `MONGODB_URI` in `.env`.
4. If running offline, Social Detox gracefully continues without error, storing chat context in session and logging persistence status.

---

## 11. FAQ and Error Code Seeding Instructions

Run the seed script to populate the SQL database with **16 comprehensive FAQs** and **all 8 required error codes**:

```bash
npm run seed --prefix server
```

Output:
```
[DB] Initializing persistent SQL database...
[Migrate] Executed 23 migration statements successfully.
[Seed] Running seed: 001_faqs_and_errors.sql...
[Seed] Running seed: 002_achievements_and_demo.sql...
[Seed] Seeding completed. Active FAQs in database: 16
[Seed] Active Error Codes in database: 8
```

---

## 12. How to Run Frontend and Backend

### Option A: Development Mode (Vite + Nodemon/TSX)

In two terminal windows:

```bash
# Terminal 1: Backend API (port 5000)
npm run dev --prefix server

# Terminal 2: Frontend Client (port 5173 with proxy to 5000)
npm run dev --prefix client
```

Open browser at: `http://localhost:5173`

### Option B: Unified Production Build

```bash
# Build frontend and backend
npm run build --prefix client
npm run build --prefix server

# Start unified server
npm start --prefix server
```

Open browser at: `http://localhost:5000`

---

## 13. API Endpoint Documentation (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register` — Register a new student account
- `POST /api/v1/auth/login` — Sign in and receive JWT token
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile & achievements

### Knowledge Base & FAQs
- `GET /api/v1/faqs` — List FAQs with optional `?category=` filter
- `GET /api/v1/faqs/search?q=...` — Search FAQs by keyword
- `GET /api/v1/faqs/:id` — Retrieve single FAQ record

### Error Code Reference
- `GET /api/v1/errors` — List all 8 documented error codes
- `GET /api/v1/errors/:code` — Retrieve single error code definition

### AI Assistant & Feedback
- `POST /api/v1/assistant/chat` — Grounded RAG conversation endpoint (Rate limited: 30 req/min)
- `POST /api/v1/assistant/feedback` — Submit helpful/not-helpful rating (Persisted to MongoDB)

### Support Tickets
- `POST /api/v1/tickets` — Submit support ticket; returns collision-safe reference `SD-YYYY-XXXXX`
- `GET /api/v1/tickets/:reference` — Track ticket resolution status
- `GET /api/v1/tickets/my` — List authenticated user's tickets

### Focus Rooms & Sprints
- `GET /api/v1/focus-rooms` — List rooms with server-calculated `remainingSeconds`
- `GET /api/v1/focus-rooms/:id` — Retrieve room state and participants
- `POST /api/v1/focus-rooms` — Create room (Host privileges)
- `POST /api/v1/focus-rooms/:id/join` — Join room as peer participant
- `POST /api/v1/focus-rooms/:id/action` — Host controls: `start`, `pause`, `resume`, `complete`
- `POST /api/v1/focus-rooms/:id/check-in` — Submit periodic accountability check-in (+5 bonus points)
- `POST /api/v1/focus-sessions/solo` — Complete solo focus sprint and award consistency points

### Circles & Leaderboard
- `GET /api/v1/friends/leaderboard` — Weekly consistency rankings: `(Streak Days * 50) + Points`
- `GET /api/v1/friends/circles` — List student squads
- `POST /api/v1/friends/circles` — Create squad with invite code
- `POST /api/v1/friends/circles/join` — Join squad using invite code
- `GET /api/v1/friends/challenges` — List active campus focus challenges
- `POST /api/v1/friends/challenges/:id/join` — Join challenge
- `GET /api/v1/friends/achievements` — List digital independence badges

### Third-Party & Operations
- `GET /api/v1/motivation` — Daily quote with 3s timeout & fallback
- `GET /api/v1/health` — System health and uptime overview
- `GET /api/v1/health/live` — Kubernetes / process liveness probe
- `GET /api/v1/health/ready` — Database & upstream readiness probe
- `GET /api/v1/health/logs` — Last 50 structured request logs (Sanitized)
- `GET /api/v1/test-error/:code` — Assessment endpoint to trigger error responses (400, 401, 403, 404, 429, 500, 503, SD-001)

---

## 14. AI Assistant Configuration & Grounded Fallback

The **Social Detox Assistant** uses grounded Retrieval-Augmented Generation (RAG):
1. **Search Phase:** When a prompt is submitted, the backend tokenizes query keywords (filtering English stopwords) and searches the SQL `faqs` table and `error_codes` registry.
2. **LLM Generation:** If `AI_API_KEY` is present, it prompts Google Gemini 1.5 Flash with the retrieved context and a strict system directive to answer *only* from verified knowledge.
3. **Resilient Fallback Mode:** If `AI_API_KEY` is absent or times out, the assistant switches to the database-backed synthesizer, composing clear, accurate answers directly from SQL records.
4. **Ticket Escalation:** When a user asks an unverified question or explicitly requests human assistance, the assistant automatically suggests ticket creation with the conversation reference.

---

## 15. Third-Party API Integration (Motivation Quote)

- **Endpoint:** `GET /api/v1/motivation`
- **External Provider:** ZenQuotes / Quotable REST API
- **Timeout Policy:** Strict 3.0-second abort controller timeout.
- **Caching:** In-memory caching with 15-minute TTL to prevent rate limit exhaustion.
- **Safe Fallback:** If the external API fails, times out, or returns unexpected payload formatting, a rotating local quote from Cal Newport, Anne Lamott, or Henry David Thoreau is returned seamlessly without breaking the client dashboard.

---

## 16. Request Logging & Health Checks

### Structured Logging
Every API request is intercepted by `requestLogger.ts`, capturing:
- ISO Timestamp
- Unique Request ID (`x-request-id` header or UUIDv4)
- HTTP Method & Path
- Response Status Code & Duration (ms)
- Client IP & User-Agent
- Sanitization: Authorization headers, JWT tokens, passwords, and sensitive request bodies are stripped.

### Health Endpoints
- **Liveness (`/api/v1/health/live`):** Returns `200 { status: 'alive' }` as long as Node process is responsive.
- **Readiness (`/api/v1/health/ready`):** Validates SQL connection (`SELECT 1`), checks MongoDB driver state, and checks AI provider configuration. Returns `503` if core SQL database is unreachable.
- **Interactive UI (`/health`):** Visual diagnostic panel with live request log inspector.

---

## 17. Security and Responsible Design

1. **No Infinite Scroll:** Conscious page layouts with clear stop points.
2. **Zero Invasive Tracking:** No background screen recording or phone telemetry scraping. Focus tracking only measures intentional time committed inside Social Detox.
3. **Collision-Safe Identifiers:** Support tickets generate sequential references with random entropy (`SD-2026-00042-89`) to prevent enumeration attacks.
4. **Anti-Gaming Caps:** Leaderboard scoring rewards daily consistency rather than 24-hour uninterrupted idling.
5. **Rate Limiting:** Multi-tiered protection against DDoS and abuse.
6. **Masked Error Responses:** Internal database connection errors or stack traces are never exposed in production HTTP responses.

---

## 18. Testing Instructions

A comprehensive test suite of 20 automated integration tests is provided in `server/src/__tests__/api.test.ts`:

```bash
# Run all automated tests
npm test --prefix server
```

### Verified Test Cases:
- [x] Liveness probe returns 200 with uptime
- [x] Readiness probe returns service status
- [x] Aggregated health check reports active engines
- [x] FAQ endpoint returns ≥ 10 seeded records from SQL database
- [x] FAQ keyword search filters questions correctly
- [x] Error code endpoint returns all 8 required codes (400, 401, 403, 404, 429, 500, 503, SD-001)
- [x] SD-001 endpoint returns focus session synchronization details
- [x] Third-party motivation API returns quote with fallback handling in under 3s
- [x] AI Assistant explains error SD-001 using grounded context
- [x] AI Assistant offers support ticket on unknown topic
- [x] Support ticket creation validates input (returns 400 on invalid email)
- [x] Support ticket creation generates collision-safe reference (`SD-YYYY-XXXXX`)
- [x] Support ticket is persisted in SQL database and retrievable by reference
- [x] Nonexistent resource returns 404 Not Found
- [x] Test error routes return 400, 401, 403, 500 correctly
- [x] 500 error response safely masks internal stack traces
- [x] Focus room endpoint returns server-calculated remaining seconds
- [x] Leaderboard returns consistency rankings

---

## 19. Deployment Instructions

### Production Deployment Architecture
- **Frontend & Backend (Unified):** Render / Railway / Heroku / Fly.io (Node.js service serving API + compiled Vite assets)
- **PostgreSQL Database:** Neon / Supabase / Render Managed PostgreSQL
- **MongoDB Database:** MongoDB Atlas free M0 tier

### Step-by-Step Deployment to Render / Railway:

1. **Create Managed PostgreSQL:**
   - In Neon or Render, create a PostgreSQL database.
   - Copy connection string: `postgresql://user:password@host/dbname?sslmode=require`.

2. **Create MongoDB Atlas Cluster:**
   - Create cluster, add database user, allow `0.0.0.0/0` IP access.
   - Copy URI: `mongodb+srv://user:pass@cluster.mongodb.net/social_detox`.

3. **Deploy Web Service on Render / Railway:**
   - Connect GitHub repository `social-detox`.
   - **Build Command:** `npm run build --prefix client && npm run build --prefix server`
   - **Start Command:** `npm start --prefix server`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `PORT=5000`
     - `DATABASE_URL=<your_postgres_url>`
     - `MONGODB_URI=<your_mongo_uri>`
     - `AI_API_KEY=<your_gemini_api_key>`
     - `JWT_SECRET=<random_32_char_secret>`

4. **Run Migrations & Seeds on Production Database:**
   - From Render Shell or locally targeting production `DATABASE_URL`:
   ```bash
   DATABASE_URL="your_prod_url" npm run migrate --prefix server
   DATABASE_URL="your_prod_url" npm run seed --prefix server
   ```

---

## 20. Live Deployment & Repository URLs

- **Live HTTPS Website URL:** `https://social-detox-production.up.railway.app` *(or custom domain)*
- **GitHub Repository URL:** `https://github.com/your-username/social-detox`

---

## 21. Proposed Future Improvement

> **“Integrate an optional browser extension or supported device-level integration to provide more accurate distraction insights, with explicit user consent and clear privacy controls.”**
>
> While Social Detox intentionally avoids invasive screen scraping, a privacy-first browser companion could allow students to opt in to automatic notification silencing and website tab snoozing during active focus room sprints, preserving user agency while eliminating external tab temptation.

---

## 22. Assessment Checklist & Verification

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **8 Required Pages** | Landing, Dashboard, Focus Rooms, Friends, FAQ, Errors, Custom 404, Custom 500 (+ Health & Support) | ✅ Complete |
| **Grounded AI Assistant** | Fixed floating widget on every page, PostgreSQL RAG, Error Code diagnosis, MongoDB chat logging, ticket creation | ✅ Complete |
| **Support Ticket System** | PostgreSQL schema, collision-safe reference (`SD-YYYY-XXXXX`), lookup, ownership validation | ✅ Complete |
| **SQL Database Design** | 13 relational tables, migrations (`001_initial_schema.sql`), dual-engine PostgreSQL + LibSQL fallback | ✅ Complete |
| **MongoDB Integration** | `ChatLog` & `Feedback` Mongoose models, size limits, secret masking, graceful offline handling | ✅ Complete |
| **8 Error Codes** | 400, 401, 403, 404, 429, 500, 503, and SD-001 with interactive troubleshooting & test triggers | ✅ Complete |
| **Third-Party API** | Motivational quote API with 3s timeout, in-memory caching, and safe local fallback | ✅ Complete |
| **Logging & Health** | Request ID header, structured request logger, `/health`, `/api/v1/health/live`, `/api/v1/health/ready` | ✅ Complete |
| **Automated Tests** | 20 passing Supertest integration tests covering all critical paths | ✅ 20/20 Passing |
| **Responsive Design** | Mobile tested down to 360px viewport width, accessible dark mode palette | ✅ Verified |
