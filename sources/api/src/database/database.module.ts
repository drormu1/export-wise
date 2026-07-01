import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Global so a single DatabaseService (one SQLite connection) is shared across
 * all feature modules without re-importing.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
