import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommitteeDecision } from './committee-decision.entity';

/**
 * A derived semantic-index artifact for one CommitteeDecision — NOT business truth.
 * SQL (CommitteeDecision) stays canonical; this table only holds the embedding and
 * enough metadata to keep it in sync and swap models safely:
 *  - `model` / `dim`: which model produced the vector and its length (read from the
 *    LLM response, never hard-coded) so switching models is detectable.
 *  - `docHash`: fingerprint of `docText`; unchanged hash + same model => skip re-embed.
 *  - `vector`: the embedding itself (stored as JSON via TypeORM 'simple-json').
 */
@Entity()
export class DecisionEmbedding {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  decisionId!: number;

  @OneToOne(() => CommitteeDecision, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'decisionId' })
  decision!: CommitteeDecision;

  /** Embedding model id that produced this vector, e.g. 'gemma3:270m'. */
  @Column()
  model!: string;

  /** Vector length, read from the model response (not hard-coded). */
  @Column()
  dim!: number;

  /** The embedding vector. 'simple-json' serializes the number[] to text (provider-agnostic). */
  @Column('simple-json')
  vector!: number[];

  /** The flat text that was embedded — kept for traceability/debugging. */
  @Column('text')
  docText!: string;

  /** SHA-256 of docText; used to skip re-embedding unchanged decisions. */
  @Index()
  @Column()
  docHash!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
