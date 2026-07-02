import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import { CommitteeDecision } from '../entities/committee-decision.entity';
import { DecisionEmbedding } from '../entities/decision-embedding.entity';
import { EMBEDDING_PROVIDER } from './embedding/embedding.provider';
import { OllamaEmbeddingProvider } from './embedding/ollama.embedding.provider';
import { VectorIndexService } from './vector-index.service';
import { VectorSearchService } from './vector-search.service';

/**
 * Wires the vector-indexing and vector-search pieces. Imports DatabaseModule
 * explicitly so it can be bootstrapped standalone by the vector-seed runner
 * (like SeedModule). EMBEDDING_PROVIDER is bound to Ollama today; swap the class
 * to change backend. VectorSearchService is exported for the AI search API.
 */
@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([CommitteeDecision, DecisionEmbedding])],
  providers: [
    VectorIndexService,
    VectorSearchService,
    { provide: EMBEDDING_PROVIDER, useClass: OllamaEmbeddingProvider },
  ],
  exports: [VectorIndexService, VectorSearchService],
})
export class VectorModule {}
