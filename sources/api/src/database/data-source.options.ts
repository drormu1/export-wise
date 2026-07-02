import { DataSourceOptions } from 'typeorm';
import { resolveDbPath } from '../config/paths';
import { Country } from '../entities/country.entity';
import { Manufacturer } from '../entities/manufacturer.entity';
import { Product } from '../entities/product.entity';
import { CommitteeDecision } from '../entities/committee-decision.entity';
import { DecisionEmbedding } from '../entities/decision-embedding.entity';

const entities = [Country, Manufacturer, Product, CommitteeDecision, DecisionEmbedding];

/**
 * Builds the TypeORM connection options from the environment so the same
 * entities/repositories run on SQLite today and SQL Server later — switching is
 * just `DB_PROVIDER=sqlserver` plus the mssql connection vars.
 *
 * synchronize:true auto-creates/updates tables from the entities (POC only;
 * switch to migrations before production).
 */
export function buildDataSourceOptions(): DataSourceOptions {
  const provider = process.env.DB_PROVIDER ?? 'sqlite';

  if (provider === 'sqlserver' || provider === 'mssql') {
    return {
      type: 'mssql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'exportwise',
      options: { encrypt: false, trustServerCertificate: true },
      entities,
      synchronize: true,
    };
  }

  // Default POC provider: SQLite via the better-sqlite3 driver.
  return {
    type: 'better-sqlite3',
    database: resolveDbPath(),
    entities,
    synchronize: true,
  };
}
