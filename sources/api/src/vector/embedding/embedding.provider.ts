/**
 * Abstraction over whatever produces embeddings. The rest of the system depends
 * only on this contract, so the model/runtime (local Ollama today, a stronger
 * VLLM model in QA later) is swapped via configuration, not code changes.
 */
export interface EmbeddingProvider {
  /** The model id in use, so callers can record which model produced a vector. */
  readonly model: string;

  /** Turns a piece of text into an embedding vector. Throws on provider failure. */
  embed(text: string): Promise<number[]>;
}

/** DI token for the active EmbeddingProvider implementation. */
export const EMBEDDING_PROVIDER = 'EMBEDDING_PROVIDER';
