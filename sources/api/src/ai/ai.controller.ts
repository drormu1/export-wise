import { Controller, Get, Query } from '@nestjs/common';
import { VectorSearchService } from '../vector/vector-search.service';

/** Advisory disclaimer attached to every AI-facing response (see guardrails). */
const DISCLAIMER =
  'התוצאות הן החלטות ועדה היסטוריות דומות, לצורך עיון בלבד. אין בהן המלצה או החלטה רשמית; ההחלטה הסופית נתונה לוועדה.';

@Controller('ai')
export class AiController {
  constructor(private readonly search: VectorSearchService) {}

  /**
   * GET /ai/search?q=&topK=
   * Semantic retrieval of similar historical committee decisions.
   * Returns ranked evidence plus an advisory disclaimer; never an official decision.
   */
  @Get('search')
  async semanticSearch(@Query('q') q?: string, @Query('topK') topK?: string) {
    const k = Number(topK);
    const result = await this.search.search(q ?? '', Number.isFinite(k) && k > 0 ? k : 5);
    return { ...result, disclaimer: DISCLAIMER };
  }
}
