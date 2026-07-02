import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [DatabaseModule, HealthModule, ManufacturerModule, ProductModule, SeedModule, AiModule],
})
export class AppModule {}
