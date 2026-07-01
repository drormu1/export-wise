import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [DatabaseModule, HealthModule, ManufacturerModule, SeedModule],
})
export class AppModule {}
