import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ENV_PATH } from '../config/paths';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

dotenv.config({ path: ENV_PATH });

/**
 * Standalone seed entry point (npm run db:seed). Boots a headless Nest context
 * so the seed logic reuses the same TypeORM DataSource as the HTTP app.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const result = await app.get(SeedService).seed();
    // eslint-disable-next-line no-console
    console.log('\nInserted row counts:');
    // eslint-disable-next-line no-console
    console.table(result.counts);
    if (result.skippedDecisions > 0) {
      // eslint-disable-next-line no-console
      console.log(`Skipped ${result.skippedDecisions} decision(s) with out-of-range references.`);
    }
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
