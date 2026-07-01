import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check(): Promise<{ status: string; db: string; timestamp: string }> {
    let dbState = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      dbState = 'connected';
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
