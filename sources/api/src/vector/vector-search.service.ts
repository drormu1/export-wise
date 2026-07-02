import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecisionEmbedding } from '../entities/decision-embedding.entity';
import { EMBEDDING_PROVIDER, EmbeddingProvider } from './embedding/embedding.provider';

/** One historical committee case returned as semantic-retrieval evidence. */
export interface SimilarCase {
  /** Cosine similarity to the query, 0..1 (higher = closer). */
  score: number;
  decisionId: number;
  manufacturer: string;
  product: string;
  category: string;
  country: string;
  region: string;
  decisionStatus: string;
  decisionReason?: string;
  conditions?: string;
  risks?: string;
  decisionDate: string;
}

export interface SemanticSearchResult {
  query: string;
  model: string;
  count: number;
  results: SimilarCase[];
}

/**
 * Semantic retrieval over the DecisionEmbedding index.
 *
 * Flow: embed the free-text query with the SAME provider/model used at indexing
 * time, then rank stored decision vectors by cosine similarity and return the
 * top matches with their full SQL-sourced details for grounding.
 *
 * POC note: similarity is computed in memory (brute force). This is deliberately
 * simple and fine for the demo dataset; it can be swapped for a real vector DB
 * later behind this same service without touching the API/controller contract.
 */
@Injectable()
export class VectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);

  constructor(
    @InjectRepository(DecisionEmbedding)
    private readonly embeddings: Repository<DecisionEmbedding>,
    @Inject(EMBEDDING_PROVIDER) private readonly embedder: EmbeddingProvider,
  ) {}

  async search(query: string, topK = 5): Promise<SemanticSearchResult> {
    const term = query.trim();
    if (!term) {
      return { query: '', model: this.embedder.model, count: 0, results: [] };
    }

    // Only compare against vectors from the current model — different models
    // produce different dimensions/geometry, so mixing them is meaningless.
    const rows = await this.embeddings.find({
      where: { model: this.embedder.model },
      relations: { decision: { manufacturer: true, product: true, country: true } },
    });

    if (rows.length === 0) {
      this.logger.warn(
        `No embeddings for model "${this.embedder.model}". Run "npm run vector:seed" first.`,
      );
      return { query: term, model: this.embedder.model, count: 0, results: [] };
    }

    let queryVector: number[];
    try {
      queryVector = await this.embedder.embed(term);
    } catch (err) {
      // Surface a clear, actionable error instead of a generic 500.
      const reason = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(`Embedding service unavailable: ${reason}`);
    }

    const scored = rows
      .map((row) => ({ row, score: this.cosine(queryVector, row.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, topK));

    const results: SimilarCase[] = scored.map(({ row, score }) => {
      const d = row.decision;
      return {
        score: Number(score.toFixed(4)),
        decisionId: d.id,
        manufacturer: d.manufacturer?.name ?? '',
        product: d.product?.name ?? '',
        category: d.product?.category ?? '',
        country: d.country?.name ?? '',
        region: d.country?.region ?? '',
        decisionStatus: d.decisionStatus,
        decisionReason: d.decisionReason ?? undefined,
        conditions: d.conditions ?? undefined,
        risks: d.risks ?? undefined,
        decisionDate: d.decisionDate,
      };
    });

    return { query: term, model: this.embedder.model, count: results.length, results };
  }

  /**
   * Cosine similarity of two equal-length vectors. Returns 0 for a zero vector
   * or a length mismatch (a mismatch means the vector predates a model change).
   */
  private cosine(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
      return 0;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
