import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ENV_PATH } from '../config/paths';
import { VectorModule } from './vector.module';
import { VectorIndexService } from './vector-index.service';

dotenv.config({ path: ENV_PATH });

/**
 * Standalone vector-seed entry point (npm run vector:seed). Run AFTER db:seed:
 * reads the committee decisions, embeds each one via the configured model, and
 * stores the vectors. Prints a per-run summary so failures are never silent.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(VectorModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const report = await app.get(VectorIndexService).indexAll();
    // eslint-disable-next-line no-console
    console.log('\nVector index summary:');
    // eslint-disable-next-line no-console
    console.table({
      attempted: report.attempted,
      embedded: report.embedded,
      skipped: report.skipped,
      failed: report.failed,
    });
    if (report.failures.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Failures:');
      // eslint-disable-next-line no-console
      console.table(report.failures);
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Vector seed failed:', err);
  process.exit(1);
});
