import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../database/database.service';
import { MOCK_DIR, SCHEMA_PATH } from '../config/paths';

interface CountryJson {
  name: string;
  region: string;
}

interface ManufacturerJson {
  code: string;
  name: string;
}

interface ProductJson {
  sku: string;
  name: string;
  category: string;
  ingredients?: string | null;
  description?: string | null;
}

/** Decision references other entities by their 0-based index in the JSON arrays. */
interface DecisionJson {
  countryId: number;
  productId: number;
  manufacturerId: number;
  decisionStatus: string;
  decisionReason?: string | null;
  conditions?: string | null;
  risks?: string | null;
  decisionDate: string;
}

export interface SeedResult {
  counts: {
    Country: number;
    Manufacturer: number;
    Product: number;
    CommitteeDecision: number;
  };
  skippedDecisions: number;
  dbPath: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Applies the schema (idempotent) then reloads all four tables from the mock
   * JSON files. Safe to re-run: existing rows are cleared in FK-safe order
   * inside a single transaction, so a failure leaves the DB unchanged.
   */
  seed(): SeedResult {
    // Ensure tables exist even if db:init was never run (CREATE ... IF NOT EXISTS).
    this.db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

    const countries = this.readJson<CountryJson[]>('countries.json');
    const manufacturers = this.readJson<ManufacturerJson[]>('manufacturers.json');
    const products = this.readJson<ProductJson[]>('products.json');
    const decisions = this.readJson<DecisionJson[]>('decisions.json');

    let skippedDecisions = 0;

    this.db.transaction(() => {
      // Clear in FK-safe order (children before parents).
      this.db.run('DELETE FROM CommitteeDecision');
      this.db.run('DELETE FROM Product');
      this.db.run('DELETE FROM Manufacturer');
      this.db.run('DELETE FROM Country');

      const countryIds = countries.map((c) =>
        Number(this.db.run('INSERT INTO Country (name, region) VALUES (?, ?)', [c.name, c.region]).lastInsertRowid),
      );

      const manufacturerIds = manufacturers.map((m) =>
        Number(this.db.run('INSERT INTO Manufacturer (code, name) VALUES (?, ?)', [m.code, m.name]).lastInsertRowid),
      );

      const productIds = products.map((p) =>
        Number(
          this.db.run(
            'INSERT INTO Product (sku, name, category, ingredients, description) VALUES (?, ?, ?, ?, ?)',
            [p.sku, p.name, p.category, p.ingredients ?? null, p.description ?? null],
          ).lastInsertRowid,
        ),
      );

      for (const d of decisions) {
        // Resolve JSON array indexes to real DB ids; skip rows with bad references.
        if (!this.inRange(d.countryId, countryIds) || !this.inRange(d.productId, productIds) || !this.inRange(d.manufacturerId, manufacturerIds)) {
          skippedDecisions += 1;
          continue;
        }

        this.db.run(
          `INSERT INTO CommitteeDecision
             (manufacturerId, productId, countryId, decisionStatus, decisionReason, conditions, risks, decisionDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            manufacturerIds[d.manufacturerId],
            productIds[d.productId],
            countryIds[d.countryId],
            d.decisionStatus,
            d.decisionReason ?? null,
            d.conditions ?? null,
            d.risks ?? null,
            d.decisionDate,
          ],
        );
      }
    });

    const result: SeedResult = {
      counts: {
        Country: this.count('Country'),
        Manufacturer: this.count('Manufacturer'),
        Product: this.count('Product'),
        CommitteeDecision: this.count('CommitteeDecision'),
      },
      skippedDecisions,
      dbPath: this.db.dbPath,
    };

    this.logger.log(`Seed complete: ${JSON.stringify(result.counts)} (skipped ${skippedDecisions})`);
    return result;
  }

  private inRange(index: number, ids: number[]): boolean {
    return Number.isInteger(index) && index >= 0 && index < ids.length;
  }

  private count(table: string): number {
    return this.db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`)?.n ?? 0;
  }

  private readJson<T>(fileName: string): T {
    return JSON.parse(fs.readFileSync(path.join(MOCK_DIR, fileName), 'utf8')) as T;
  }
}
