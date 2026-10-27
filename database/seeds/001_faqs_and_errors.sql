-- Seed 8 Required Error Codes
INSERT INTO error_codes (code, title, category, explanation, causes, resolution_steps, is_retryable) VALUES
('400', 'Bad Request', 'Client Error', 'The server could not understand or process the request due to invalid syntax, missing parameters, or payload validation failure.', '1. Required form fields missing.\n2. Malformed JSON payload.\n3. Invalid duration or parameters passed.', 'Check form inputs, ensure all mandatory fields are provided with correct types, and resubmit.', FALSE),

('401', 'Unauthorized', 'Authentication', 'Authentication is required and has failed or has not been provided. Your session token is either missing or expired.', '1. Session token expired.\n2. Attempting to access protected focus rooms without logging in.\n3. Invalid email or password.', 'Log in again via /login to obtain a fresh session token, or verify your email and password.', TRUE),

('403', 'Forbidden', 'Authorization', 'The server understood the request, but you do not have permission to access the requested resource or private room.', '1. Attempting to join a private room without an invite.\n2. Trying to edit another user''s profile or tickets.\n3. Admin-only action attempted.', 'Check that you have joined the correct room or circle, or request permission from the group creator.', FALSE),

('404', 'Not Found', 'Navigation & Lookup', 'The requested resource, room, URL, or user profile could not be found on the server.', '1. Typing an incorrect or misspelled URL.\n2. Focus room has concluded and closed.\n3. Ticket ID or challenge does not exist.', 'Verify the URL, return to the Dashboard or Focus Rooms directory, or search the FAQ.', FALSE),

('429', 'Too Many Requests', 'Rate Limiting', 'You have sent too many requests in a given amount of time. Social Detox applies rate limits to prevent spam and abuse.', '1. Rapidly firing AI assistant prompts.\n2. Repeated ticket submissions in a short window.\n3. Excessive API polling.', 'Wait 60 seconds before making additional requests. The assistant rate limit resets automatically.', TRUE),

('500', 'Internal Server Error', 'Server Error', 'An unexpected condition was encountered on the server that prevented it from fulfilling the request.', '1. Unexpected unhandled exception in backend logic.\n2. Temporary service interruption.\n3. Internal query execution failure.', 'Refresh the page or retry the request after a few seconds. If the issue persists, submit a support ticket.', TRUE),

('503', 'Service Unavailable', 'Service Health', 'The server is currently unable to handle the request due to temporary overloading or maintenance of a downstream service.', '1. PostgreSQL or MongoDB undergoing maintenance.\n2. High traffic surge during simultaneous study sessions.\n3. Upstream motivation or AI API temporarily unreachable.', 'Wait 15-30 seconds and retry. If a database is offline, read-only cached features remain available.', TRUE),

('SD-001', 'Focus Session Synchronization Failed', 'Focus Room Engine', 'The client clock drifted or the real-time WebSocket connection was interrupted during a synchronized focus session.', '1. Network drop or Wi-Fi reconnect during an active timer.\n2. Background tab throttling causing local clock drift.\n3. Server heartbeat timeout (>45s) between peer clients.', 'Click "Resync Timer" in the room header, or refresh the room. Your logged focus minutes are preserved server-side.', TRUE)
ON CONFLICT(code) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  explanation = EXCLUDED.explanation,
  causes = EXCLUDED.causes,
  resolution_steps = EXCLUDED.resolution_steps,
  is_retryable = EXCLUDED.is_retryable;


-- Seed 16 Comprehensive FAQs Stored in PostgreSQL
INSERT INTO faqs (id, category, question, answer, helpful_count, order_index, is_active) VALUES
('faq-01', 'purpose', 'What is Social Detox and how does it make being offline the new flex?', 'Social Detox is a student and youth-focused digital wellness platform designed to flip traditional social media dynamics. Instead of rewarding endless scrolling and engagement, we reward you for intentional offline time, focused deep work, and real-life connections. Your focus minutes, streaks, and milestones become your flex.', 142, 1, TRUE),

('faq-02', 'timer', 'How does the synchronized focus timer work in Focus Rooms?', 'In Focus Rooms, the timer is governed by a server-controlled master clock rather than relying solely on individual device countdowns. When a host starts or pauses a session, the server broadcasts state changes via WebSockets. If your browser sleeps or reconnects, the client calculates remaining time from the server timestamp, preventing clock drift or cheating.', 98, 2, TRUE),

('faq-03', 'points', 'How are points and leaderboard rankings calculated?', 'Points reward consistency, focus duration, and active check-ins. You earn 10 points per 15 minutes of uninterrupted focus, bonus points for completing daily streaks, and extra points for group challenges. Sensible daily caps prevent gaming the system with unattended sessions.', 85, 3, TRUE),

('faq-04', 'streaks', 'How do streaks work, and what happens if I miss a day?', 'A streak increases by 1 each calendar day you complete at least your chosen daily focus goal (default 120 minutes, customizable). If you miss a day, the active streak resets, but your "Longest Streak" remains permanently recorded on your profile.', 73, 4, TRUE),

('faq-05', 'rooms', 'Can I pause a focus session in a room, or does only the host have control?', 'In synchronized group rooms, the room creator/host has master control to start, pause, resume, or finish the session. Individual participants can check in, mute sounds, or leave. In solo sessions, you have full control over your personal timer.', 64, 5, TRUE),

('faq-06', 'groups', 'How do Friend Circles and shared focus challenges work?', 'Friend Circles let you form study squads with classmates or friends using unique invite codes. Within a circle, members see weekly consistency leaderboards, join shared study milestones, and hold each other accountable without invasive surveillance.', 55, 6, TRUE),

('faq-07', 'privacy', 'Does Social Detox monitor or spy on my other apps or browser history?', 'No! Social Detox firmly adheres to ethical privacy standards. We do NOT install invasive spyware, keyloggers, or background screen scrapers. Session tracking measures intentional time you commit inside the Social Detox app. We believe genuine self-discipline works best with user consent.', 120, 7, TRUE),

('faq-08', 'troubleshooting', 'What should I do if I get error SD-001 (Focus Session Synchronization Failed)?', 'Error SD-001 happens when your device loses network connection or your browser tab was throttled in the background. To fix it, click the "Resync" button on the room timer or reload the page. The server preserves your accrued time and reconnects you to the live state.', 89, 8, TRUE),

('faq-09', 'support', 'How do I submit a support ticket if I run into a bug or issue?', 'You can submit a support ticket anytime from the /support page, the custom error pages, or directly through the Social Detox Assistant in the chat widget. You will receive a unique ticket reference code (e.g. SD-2026-00001) to track the resolution.', 47, 9, TRUE),

('faq-10', 'assistant', 'How does the Social Detox AI Assistant answer my questions?', 'The assistant uses grounded retrieval (RAG) over our PostgreSQL FAQ database and error registry. It provides practical troubleshooting steps and answers about app mechanics. If information is unavailable or you need human help, it automatically offers to create a support ticket.', 67, 10, TRUE),

('faq-11', 'achievements', 'What are achievements and how do I unlock the "Touch Grass Champion" badge?', 'Achievements celebrate real-world digital independence milestones. "Touch Grass Champion" is unlocked when you complete a 3-hour focus session on a weekend day without opening any distractions. Other badges include "The Notification Dodger" and "Weekend Offline Legend".', 110, 11, TRUE),

('faq-12', 'timer', 'Can I customize my personal daily focus goal?', 'Yes! From your Dashboard settings, you can adjust your daily focus goal from 30 minutes up to 480 minutes (8 hours) depending on your study or work schedule. The dashboard progress ring and streak calculation adapt dynamically to your personal goal.', 52, 12, TRUE),

('faq-13', 'security', 'Can guests use Focus Rooms and submit support tickets without an account?', 'Yes! Guests can browse public rooms, read FAQs, inspect error codes, use the motivation quote, and submit support tickets using their email. Creating an account allows you to save focus statistics, join private circles, and compete on leaderboards.', 41, 13, TRUE),

('faq-14', 'troubleshooting', 'What happens if MongoDB or the AI service is temporarily unavailable?', 'Social Detox is built with high resilience. If MongoDB or the external AI provider is offline, the backend catches the disruption gracefully, logs it, and switches to SQL-backed FAQ searches and localized error resolutions without crashing your focus room or timer.', 63, 14, TRUE),

('faq-15', 'rooms', 'What are "Check-Ins" during a focus session?', 'Every 20–30 minutes, an optional interactive prompt appears asking you to confirm you are still engaged with your task. Completing check-ins earns bonus accountability points and confirms your active attendance to room participants.', 78, 15, TRUE),

('faq-16', 'general', 'Is Social Detox completely free for students and study groups?', 'Yes, Social Detox was built as an open, accessible student productivity platform. There are no paywalls, hidden microtransactions, or addictive dark patterns designed to keep you glued to your screen.', 95, 16, TRUE)
ON CONFLICT(id) DO UPDATE SET
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  helpful_count = EXCLUDED.helpful_count,
  order_index = EXCLUDED.order_index;
