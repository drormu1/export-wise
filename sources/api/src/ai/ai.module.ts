import { Module } from '@nestjs/common';
import { VectorModule } from '../vector/vector.module';
import { AiController } from './ai.controller';

/**
 * AI-facing HTTP surface. Keeps the web controller separate from VectorModule
 * (which is also bootstrapped headless by the vector-seed runner) and depends
 * only on the exported VectorSearchService.
 */
@Module({
  imports: [VectorModule],
  controllers: [AiController],
})
export class AiModule {}
