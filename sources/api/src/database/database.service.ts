import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { resolveDbPath } from '../config/paths';

/**
 * Provider-agnostic data-access wrapper around better-sqlite3.
 *
 * The public surface (query/get/run/exec/transaction) intentionally avoids
 * leaking driver specifics so a SQL Server implementation can be swapped in
 * later behind the same contract. SQLite is the default POC provider.
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly db: Database.Database;
  public readonly dbPath: string;

  constructor() {
    this.dbPath = resolveDbPath();

    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    // WAL improves concurrent read/write; FK enforcement guards referential integrity.
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.logger.log(`SQLite connection opened at ${this.dbPath}`);
  }

  /** Returns all rows for a SELECT. */
  query<T = unknown>(sql: string, params: unknown[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  /** Returns the first row for a SELECT, or undefined. */
  get<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  /** Executes an INSERT/UPDATE/DELETE and returns the driver run result. */
  run(sql: string, params: unknown[] = []): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  /** Executes one or more statements (e.g. a schema file). No parameters. */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /** Runs the given function inside a single transaction. */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  onModuleDestroy(): void {
    this.db.close();
    this.logger.log('SQLite connection closed');
  }
}
