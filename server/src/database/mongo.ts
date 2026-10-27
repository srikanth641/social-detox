import mongoose, { Schema, Document } from 'mongoose';
import { ENV } from '../config/env.js';

export interface IChatLog extends Document {
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  route: string;
  errorCode?: string;
  timestamp: Date;
}

const ChatLogSchema = new Schema<IChatLog>({
  conversationId: { type: String, required: true, index: true },
  userId: { type: String, default: 'anonymous', index: true },
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true, maxlength: 4000 },
  route: { type: String, default: '/' },
  errorCode: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
});

export interface IFeedback extends Document {
  conversationId: string;
  messageId: string;
  rating: 'helpful' | 'not_helpful';
  feedbackText?: string;
  timestamp: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  conversationId: { type: String, required: true, index: true },
  messageId: { type: String, required: true },
  rating: { type: String, required: true, enum: ['helpful', 'not_helpful'] },
  feedbackText: { type: String, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now },
});

export const ChatLog = mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export class MongoManager {
  public isConnected: boolean = false;
  private connectionError: string | null = null;

  public async init(): Promise<void> {
    if (!ENV.MONGODB_URI) {
      console.warn('[MongoDB] MONGODB_URI not configured. Chat logging will notify users that MongoDB persistence is offline.');
      this.isConnected = false;
      return;
    }

    try {
      console.log('[MongoDB] Connecting to MongoDB instance...');
      mongoose.set('strictQuery', false);
      await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
      });
      this.isConnected = true;
      this.connectionError = null;
      console.log('[MongoDB] Successfully connected to MongoDB.');
    } catch (err: any) {
      this.isConnected = false;
      this.connectionError = err.message;
      console.warn(`[MongoDB] Connection failed (${err.message}). Chat logs will handle unavailability gracefully.`);
    }

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      console.warn('[MongoDB] Connection lost.');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      console.log('[MongoDB] Reconnected successfully.');
    });
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      readyState: mongoose.connection.readyState,
      error: this.connectionError,
    };
  }
}

export const mongoManager = new MongoManager();
