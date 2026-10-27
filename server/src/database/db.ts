import { Pool } from 'pg';
import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env.js';

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class DatabaseManager {
  private pgPool: Pool | null = null;
  private libSqlClient: Client | null = null;
  public engine: 'postgres' | 'libsql' = 'libsql';
  public isConnected: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  public async init(): Promise<void> {
    // 1. Try PostgreSQL if DATABASE_URL is set
    if (ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith('postgres')) {
      try {
        console.log('[DB] Connecting to PostgreSQL database...');
        const pool = new Pool({
          connectionString: ENV.DATABASE_URL,
          connectionTimeoutMillis: 5000,
          ssl: (ENV.NODE_ENV === 'production' || !ENV.DATABASE_URL.includes('localhost')) ? { rejectUnauthorized: false } : false,
        });

        // Test connection
        await pool.query('SELECT 1');
        this.pgPool = pool;
        this.engine = 'postgres';
        this.isConnected = true;
        console.log('[DB] Successfully connected to PostgreSQL.');
        return;
      } catch (err: any) {
        console.warn(`[DB] PostgreSQL connection failed (${err.message}). Falling back to local persistent SQL engine.`);
      }
    }

    // 2. Fallback to LibSQL / SQLite persistent file
    try {
      const dbDir = path.resolve(__dirname, '../../../database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const dbPath = path.join(dbDir, 'social_detox.db');
      console.log(`[DB] Initializing persistent local SQL database at: ${dbPath}`);

      this.libSqlClient = createClient({
        url: `file:${dbPath.replace(/\\/g, '/')}`,
      });
      this.engine = 'libsql';
      this.isConnected = true;
      console.log('[DB] Persistent local SQL database initialized successfully.');
    } catch (err: any) {
      console.error('[DB] Failed to initialize persistent SQL engine:', err);
      this.isConnected = false;
    }
  }

  public async ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    await this.ensureReady();

    if (this.engine === 'postgres' && this.pgPool) {
      const result = await this.pgPool.query(sql, params);
      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || result.rows.length,
      };
    }

    if (this.engine === 'libsql' && this.libSqlClient) {
      // LibSQL uses '?' instead of '$1, $2, ...'
      let convertedSql = sql;
      if (params.length > 0) {
        // Convert $1, $2 to ? for SQLite compatibility
        convertedSql = sql.replace(/\$\d+/g, '?');
      }

      // SQLite timestamp conversions / interval compatibility
      // Replace "INTERVAL '7 days'" with "'+7 days'"
      convertedSql = convertedSql.replace(/INTERVAL '(\d+)\s+days?'/gi, "'+$1 days'");
      // Replace CURRENT_TIMESTAMP with datetime('now') if needed, though CURRENT_TIMESTAMP is supported in SQLite

      const result = await this.libSqlClient.execute({
        sql: convertedSql,
        args: params,
      });

      return {
        rows: result.rows as unknown as T[],
        rowCount: result.rows.length || (result.rowsAffected || 0),
      };
    }

    throw new Error('Database is not initialized or connected.');
  }

  public async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
    }
    if (this.libSqlClient) {
      this.libSqlClient.close();
    }
    this.isConnected = false;
  }
}

export const db = new DatabaseManager();
