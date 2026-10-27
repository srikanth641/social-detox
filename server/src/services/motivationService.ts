import { ENV } from '../config/env.js';

export interface MotivationQuote {
  quote: string;
  author: string;
  source: 'remote' | 'cache' | 'fallback';
  fetchedAt: string;
}

const FALLBACK_QUOTES = [
  {
    quote: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott"
  },
  {
    quote: "Disconnect from the noise to reconnect with your clarity, your friends, and your purpose.",
    author: "Social Detox Manifesto"
  },
  {
    quote: "Deep work is the ability to focus without distraction on a cognitively demanding task. It makes you flex in the modern economy.",
    author: "Cal Newport"
  },
  {
    quote: "You will never reach your destination if you stop and throw stones at every dog that barks.",
    author: "Winston Churchill"
  },
  {
    quote: "The price of anything is the amount of life you exchange for it.",
    author: "Henry David Thoreau"
  },
  {
    quote: "Attention is the rarest and purest form of generosity.",
    author: "Simone Weil"
  }
];

class MotivationService {
  private cachedQuote: MotivationQuote | null = null;
  private cacheExpiresAt: number = 0;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

  public async getDailyMotivation(): Promise<MotivationQuote> {
    const now = Date.now();

    // 1. Return cached quote if valid
    if (this.cachedQuote && now < this.cacheExpiresAt) {
      return {
        ...this.cachedQuote,
        source: 'cache',
      };
    }

    // 2. Fetch from external API with strict 3-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(ENV.MOTIVATION_API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SocialDetox/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External motivation API responded with HTTP ${response.status}`);
      }

      const data: any = await response.json();

      // ZenQuotes returns array of [{ q: "quote", a: "author" }]
      let quoteText = '';
      let authorName = 'Unknown';

      if (Array.isArray(data) && data[0]?.q) {
        quoteText = data[0].q;
        authorName = data[0].a || 'Unknown';
      } else if (data.content && data.author) {
        quoteText = data.content;
        authorName = data.author;
      } else if (data.slip?.advice) {
        quoteText = data.slip.advice;
        authorName = 'Daily Wisdom';
      }

      if (!quoteText || quoteText.trim().length === 0) {
        throw new Error('Invalid format returned by external motivation API');
      }

      const freshQuote: MotivationQuote = {
        quote: quoteText.trim(),
        author: authorName.trim(),
        source: 'remote',
        fetchedAt: new Date().toISOString(),
      };

      this.cachedQuote = freshQuote;
      this.cacheExpiresAt = now + this.CACHE_TTL_MS;

      return freshQuote;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[Motivation] Upstream API call failed or timed out: ${err.message}. Using safe offline fallback.`);

      // Pick a rotating fallback quote based on current date
      const dayOfYear = Math.floor(now / (1000 * 60 * 60 * 24));
      const fallbackItem = FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];

      const fallbackQuote: MotivationQuote = {
        quote: fallbackItem.quote,
        author: fallbackItem.author,
        source: 'fallback',
        fetchedAt: new Date().toISOString(),
      };

      // Cache fallback for 5 minutes so we don't spam a failing upstream API
      this.cachedQuote = fallbackQuote;
      this.cacheExpiresAt = now + (5 * 60 * 1000);

      return fallbackQuote;
    }
  }
}

export const motivationService = new MotivationService();
