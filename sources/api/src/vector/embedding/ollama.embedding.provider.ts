import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from './embedding.provider';

/**
 * EmbeddingProvider backed by a local/remote Ollama server (POST /api/embed).
 * Configuration comes from the environment so switching model or host needs no
 * code change:
 *   OLLAMA_URL   - base URL (default http://localhost:11434)
 *   EMBED_MODEL  - model id  (default nomic-embed-text)
 *
 * The vector length is whatever the model returns; we never assume a dimension.
 */
@Injectable()
export class OllamaEmbeddingProvider implements EmbeddingProvider {
  private readonly baseUrl = (process.env.OLLAMA_URL ?? 'http://localhost:11434').replace(/\/$/, '');
  readonly model = process.env.EMBED_MODEL ?? 'nomic-embed-text';

  async embed(text: string): Promise<number[]> {
    const url = `${this.baseUrl}/api/embed`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, input: text }),
      });
    } catch (err) {
      // Connection refused / DNS / timeout: make the cause obvious to the operator.
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`Ollama not reachable at ${url} (model "${this.model}"): ${reason}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Ollama embed failed (${res.status} ${res.statusText}) at ${url}: ${detail}`);
    }

    const body = (await res.json()) as { embeddings?: number[][] };
    const vector = body.embeddings?.[0];
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error(`Ollama returned no embedding for model "${this.model}"`);
    }
    return vector;
  }
}
