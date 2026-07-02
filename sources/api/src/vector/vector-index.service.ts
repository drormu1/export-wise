import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { CommitteeDecision } from '../entities/committee-decision.entity';
import { DecisionEmbedding } from '../entities/decision-embedding.entity';
import { EMBEDDING_PROVIDER, EmbeddingProvider } from './embedding/embedding.provider';

/** Per-run outcome, so nothing fails silently (see vector-context.md). */
export interface IndexReport {
  attempted: number;
  embedded: number;
  skipped: number;
  failed: number;
  failures: { decisionId: number; error: string }[];
}

/**
 * Builds a flat text document from each CommitteeDecision, embeds it via the
 * configured model, and upserts the vector into DecisionEmbedding.
 *
 * Idempotent: a decision whose docText hash and model are unchanged is skipped,
 * so re-runs don't re-call the LLM. SQL stays the source of truth; this only
 * derives the semantic index from it.
 */
@Injectable()
export class VectorIndexService {
  private readonly logger = new Logger(VectorIndexService.name);

  constructor(
    @InjectRepository(CommitteeDecision)
    private readonly decisions: Repository<CommitteeDecision>,
    @InjectRepository(DecisionEmbedding)
    private readonly embeddings: Repository<DecisionEmbedding>,
    @Inject(EMBEDDING_PROVIDER) private readonly embedder: EmbeddingProvider,
  ) {}

  /** Indexes every decision. Failures are isolated and reported, not thrown. */
  async indexAll(): Promise<IndexReport> {
    const decisions = await this.decisions.find({
      relations: { manufacturer: true, product: true, country: true },
      order: { id: 'ASC' },
    });

    const existing = new Map(
      (await this.embeddings.find()).map((e) => [e.decisionId, e]),
    );

    const report: IndexReport = {
      attempted: decisions.length,
      embedded: 0,
      skipped: 0,
      failed: 0,
      failures: [],
    };

    for (const decision of decisions) {
      const docText = this.buildDocText(decision);
      const docHash = this.hash(docText);
      const prev = existing.get(decision.id);

      // Skip only when the content AND the model are unchanged.
      if (prev && prev.docHash === docHash && prev.model === this.embedder.model) {
        report.skipped += 1;
        continue;
      }

      try {
        const vector = await this.embedder.embed(docText);
        await this.embeddings.save({
          id: prev?.id,
          decisionId: decision.id,
          model: this.embedder.model,
          dim: vector.length,
          vector,
          docText,
          docHash,
        });
        report.embedded += 1;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        report.failed += 1;
        report.failures.push({ decisionId: decision.id, error });
        this.logger.error(`Decision ${decision.id} embedding failed: ${error}`);
      }
    }

    this.logger.log(
      `Vector index complete: attempted=${report.attempted} embedded=${report.embedded} ` +
        `skipped=${report.skipped} failed=${report.failed} (model=${this.embedder.model})`,
    );
    return report;
  }

  /**
   * Flattens a decision into a single labeled text with all meaningful fields,
   * including the human-readable manufacturer / product / country names. The same
   * builder must be used for indexing and (later) query construction.
   */
  private buildDocText(d: CommitteeDecision): string {
    const lines = [
      `יצרן: ${d.manufacturer?.name ?? ''}`,
      `מוצר: ${d.product?.name ?? ''}`,
      `קטגוריה: ${d.product?.category ?? ''}`,
      `רכיבים: ${d.product?.ingredients ?? ''}`,
      `תיאור מוצר: ${d.product?.description ?? ''}`,
      `מדינת יעד: ${d.country?.name ?? ''}`,
      `אזור: ${d.country?.region ?? ''}`,
      `סטטוס החלטה: ${d.decisionStatus}`,
      `נימוק: ${d.decisionReason ?? ''}`,
      `תנאים: ${d.conditions ?? ''}`,
      `סיכונים: ${d.risks ?? ''}`,
      `תאריך החלטה: ${d.decisionDate}`,
    ];
    // Drop rows whose value is empty so blank fields don't add noise to the vector.
    return lines.filter((line) => !line.endsWith(': ')).join('\n');
  }

  private hash(text: string): string {
    return createHash('sha256').update(text, 'utf8').digest('hex');
  }
}
