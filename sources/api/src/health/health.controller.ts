import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  check(): { status: string; db: string; timestamp: string } {
    let dbState = 'disconnected';
    try {
      const row = this.db.get<{ x: number }>('SELECT 1 AS x');
      dbState = row?.x === 1 ? 'connected' : 'error';
    } catch {
      dbState = 'error';
    }

    return {
      status: 'ok',
      db: dbState,
      timestamp: new Date().toISOString(),
    };
  }
}
