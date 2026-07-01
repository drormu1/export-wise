import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MOCK_DIR } from '../config/paths';
import { Country } from '../entities/country.entity';
import { Manufacturer } from '../entities/manufacturer.entity';
import { Product } from '../entities/product.entity';
import { CommitteeDecision } from '../entities/committee-decision.entity';

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
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Reloads all four tables from the mock JSON files. Tables are created by
   * TypeORM synchronize on connection. Safe to re-run: existing rows are cleared
   * in FK-safe order inside a single transaction, so a failure leaves the DB unchanged.
   */
  async seed(): Promise<SeedResult> {
    const countries = this.readJson<CountryJson[]>('countries.json');
    const manufacturers = this.readJson<ManufacturerJson[]>('manufacturers.json');
    const products = this.readJson<ProductJson[]>('products.json');
    const decisions = this.readJson<DecisionJson[]>('decisions.json');

    let skippedDecisions = 0;

    await this.dataSource.transaction(async (em) => {
      // Clear in FK-safe order (children before parents).
      await em.createQueryBuilder().delete().from(CommitteeDecision).execute();
      await em.createQueryBuilder().delete().from(Product).execute();
      await em.createQueryBuilder().delete().from(Manufacturer).execute();
      await em.createQueryBuilder().delete().from(Country).execute();

      // Reset auto-increment counters so ids are deterministic (1..N) on every reseed.
      // (SQLite POC; SQL Server would reset identity differently.)
      const dbType = this.dataSource.options.type as string;
      if (dbType === 'better-sqlite3' || dbType === 'sqlite') {
        await em.query('DELETE FROM sqlite_sequence');
      }

      const countryRows = await em.save(
        Country,
        countries.map((c) => ({ name: c.name, region: c.region })),
      );

      const manufacturerRows = await em.save(
        Manufacturer,
        manufacturers.map((m) => ({ code: m.code, name: m.name })),
      );
      const idByCode = new Map(manufacturerRows.map((m) => [m.code, m.id]));

      const productRows = await em.save(
        Product,
        products.map((p) => {
          // A product's manufacturer is encoded in its SKU prefix, e.g. "TNV-001" -> "TNV".
          const code = p.sku.split('-')[0];
          const manufacturerId = idByCode.get(code);
          if (manufacturerId === undefined) {
            throw new Error(`Product "${p.sku}": SKU prefix "${code}" matches no manufacturer code`);
          }
          return {
            sku: p.sku,
            manufacturerId,
            name: p.name,
            category: p.category,
            ingredients: p.ingredients ?? undefined,
            description: p.description ?? undefined,
          };
        }),
      );

      const decisionRows = decisions
        .filter((d) => {
          const ok =
            this.inRange(d.countryId, countryRows.length) &&
            this.inRange(d.productId, productRows.length) &&
            this.inRange(d.manufacturerId, manufacturerRows.length);
          if (!ok) skippedDecisions += 1;
          return ok;
        })
        .map((d) => ({
          manufacturerId: manufacturerRows[d.manufacturerId].id,
          productId: productRows[d.productId].id,
          countryId: countryRows[d.countryId].id,
          decisionStatus: d.decisionStatus,
          decisionReason: d.decisionReason ?? undefined,
          conditions: d.conditions ?? undefined,
          risks: d.risks ?? undefined,
          decisionDate: d.decisionDate,
        }));

      await em.save(CommitteeDecision, decisionRows);
    });

    const result: SeedResult = {
      counts: {
        Country: await this.dataSource.getRepository(Country).count(),
        Manufacturer: await this.dataSource.getRepository(Manufacturer).count(),
        Product: await this.dataSource.getRepository(Product).count(),
        CommitteeDecision: await this.dataSource.getRepository(CommitteeDecision).count(),
      },
      skippedDecisions,
    };

    this.logger.log(`Seed complete: ${JSON.stringify(result.counts)} (skipped ${skippedDecisions})`);
    return result;
  }

  private inRange(index: number, length: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < length;
  }

  private readJson<T>(fileName: string): T {
    return JSON.parse(fs.readFileSync(path.join(MOCK_DIR, fileName), 'utf8')) as T;
  }
}
