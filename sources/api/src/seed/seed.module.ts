import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SeedService } from './seed.service';

/**
 * Imports DatabaseModule explicitly so this module can be bootstrapped as a
 * standalone application context by the seed runner (outside AppModule).
 */
@Module({
  imports: [DatabaseModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
