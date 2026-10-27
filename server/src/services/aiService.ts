import { db } from '../database/db.js';
import { ERROR_REGISTRY, ErrorCodeDefinition } from '../config/errorRegistry.js';
import { ENV } from '../config/env.js';
import { ChatLog, mongoManager } from '../database/mongo.js';

export interface AssistantChatRequest {
  conversationId: string;
  userId?: string;
  message: string;
  route?: string;
  errorCode?: string;
}

export interface AssistantChatResponse {
  conversationId: string;
  messageId: string;
  reply: string;
  sources: {
    faqs: { id: string; question: string }[];
    errorCode?: string;
  };
  suggestTicket: boolean;
  modelUsed: string;
  persistedToMongo: boolean;
}

export class AIService {
  /**
   * Grounded search across SQL FAQs based on keywords in user prompt
   */
  public static async searchRelevantFaqs(query: string): Promise<any[]> {
    const STOP_WORDS = new Set([
      'what', 'why', 'how', 'when', 'where', 'who', 'the', 'and', 'for', 'with',
      'that', 'this', 'are', 'is', 'was', 'can', 'does', 'did', 'you', 'your',
      'about', 'from', 'have', 'has', 'had', 'not', 'will', 'would', 'could', 'should'
    ]);

    const cleanTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    if (cleanTokens.length === 0) {
      return [];
    }

    // Build SQL condition
    const conditions = cleanTokens.map((_, i) => `(LOWER(question) LIKE $${i + 1} OR LOWER(answer) LIKE $${i + 1})`).join(' OR ');
    const params = cleanTokens.map(t => `%${t}%`);

    try {
      const res = await db.query(
        `SELECT id, category, question, answer FROM faqs WHERE ${conditions} LIMIT 4`,
        params
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  /**
   * Detects if user is asking about a specific error code
   */
  public static detectErrorCode(query: string, hintCode?: string): ErrorCodeDefinition | null {
    if (hintCode && ERROR_REGISTRY[hintCode]) {
      return ERROR_REGISTRY[hintCode];
    }

    const upper = query.toUpperCase();
    for (const code of Object.keys(ERROR_REGISTRY)) {
      if (upper.includes(code)) {
        return ERROR_REGISTRY[code];
      }
    }
    return null;
  }

  /**
   * Main assistant chat processing with RAG and fallback
   */
  public static async handleChat(req: AssistantChatRequest): Promise<AssistantChatResponse> {
    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const matchedFaqs = await this.searchRelevantFaqs(req.message);
    const matchedError = this.detectErrorCode(req.message, req.errorCode);

    let reply = '';
    let suggestTicket = false;
    let modelUsed = 'database-rag-fallback';

    // 1. Build Grounded Context
    const contextSegments: string[] = [];
    if (matchedError) {
      contextSegments.push(
        `[Error Code: ${matchedError.code} - ${matchedError.title}]\n` +
        `Explanation: ${matchedError.explanation}\n` +
        `Causes: ${matchedError.causes.join('; ')}\n` +
        `Steps to resolve: ${matchedError.resolutionSteps.join('; ')}\n` +
        `Is retryable: ${matchedError.isRetryable ? 'Yes' : 'No'}`
      );
    }

    if (matchedFaqs.length > 0) {
      contextSegments.push(
        'Relevant FAQs from Social Detox Database:\n' +
        matchedFaqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      );
    }

    const isUnknownTopic = matchedFaqs.length === 0 && !matchedError;

    // 2. Try Gemini / OpenAI API if AI_API_KEY is configured
    if (ENV.AI_API_KEY && ENV.AI_API_KEY !== 'your_ai_api_key_here') {
      try {
        const promptSystem = `You are the Social Detox Assistant, an empathetic and helpful digital wellness guide.
Your goal is to help students break social media addiction, synchronize focus sessions, and understand app features and error codes.
Answer strictly and grounded on the provided context below.
If the information is insufficient or not present in the context, politely state: "I don't have enough verified information on that in our knowledge base. Would you like me to open a support ticket for our engineering team?"
Never fabricate policies, private accounts, or fake error definitions.

--- CONTEXT ---
${contextSegments.join('\n\n')}
--- END CONTEXT ---

User prompt: ${req.message}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.AI_MODEL}:generateContent?key=${ENV.AI_API_KEY}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const aiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptSystem }] }],
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (aiRes.ok) {
          const aiJson: any = await aiRes.json();
          const generated = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated) {
            reply = generated.trim();
            modelUsed = ENV.AI_MODEL;
            if (reply.toLowerCase().includes('support ticket') || reply.toLowerCase().includes("don't have enough verified")) {
              suggestTicket = true;
            }
          }
        }
      } catch (err: any) {
        console.warn(`[AI Assistant] Live AI call failed (${err.message}). Using grounded database fallback.`);
      }
    }

    // 3. Grounded Fallback if AI was unconfigured or failed
    if (!reply) {
      if (matchedError) {
        reply = `**${matchedError.title} (${matchedError.code})**\n\n` +
          `${matchedError.explanation}\n\n` +
          `**Common Causes:**\n${matchedError.causes.map(c => `• ${c}`).join('\n')}\n\n` +
          `**Recommended Resolution:**\n${matchedError.resolutionSteps.map(s => `• ${s}`).join('\n')}\n\n` +
          `*Retryable:* ${matchedError.isRetryable ? 'Yes — you can safely retry.' : 'No — check the required action above.'}`;
      } else if (matchedFaqs.length > 0) {
        reply = `Here is what I found in our verified knowledge base:\n\n` +
          matchedFaqs.map(f => `### ${f.question}\n${f.answer}`).join('\n\n') +
          `\n\n*Does this answer your question, or would you like to create a support ticket for further assistance?*`;
      } else {
        reply = `I don't have enough verified information in our Social Detox FAQ database to answer that with complete confidence.\n\n` +
          `I can immediately help you create a **Support Ticket** so our support team can assist you directly. Would you like me to open a ticket?`;
        suggestTicket = true;
      }
    }

    if (isUnknownTopic) {
      suggestTicket = true;
    }

    // 4. Persist conversation log to MongoDB if connected
    let persistedToMongo = false;
    if (mongoManager.isConnected) {
      try {
        await ChatLog.create({
          conversationId: req.conversationId,
          userId: req.userId || 'anonymous',
          role: 'user',
          content: req.message.substring(0, 4000),
          route: req.route || '/',
          errorCode: req.errorCode || '',
          timestamp: new Date(),
        });

        await ChatLog.create({
          conversationId: req.conversationId,
          userId: req.userId || 'anonymous',
          role: 'assistant',
          content: reply.substring(0, 4000),
          route: req.route || '/',
          errorCode: matchedError ? matchedError.code : '',
          timestamp: new Date(),
        });
        persistedToMongo = true;
      } catch (mErr: any) {
        console.warn('[MongoDB] Failed to persist chat log:', mErr.message);
      }
    }

    return {
      conversationId: req.conversationId,
      messageId,
      reply,
      sources: {
        faqs: matchedFaqs.map(f => ({ id: f.id, question: f.question })),
        errorCode: matchedError?.code,
      },
      suggestTicket,
      modelUsed,
      persistedToMongo,
    };
  }
}
