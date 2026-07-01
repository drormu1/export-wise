import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ManufacturerSummary {
  id: number;
  code: string;
  name: string;
  productCount: number;
}

export interface ManufacturerRef {
  id: number;
  code: string;
  name: string;
}

export interface ProductRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  ingredients: string | null;
  description: string | null;
}

export interface ManufacturerProductsResult {
  manufacturer: ManufacturerRef;
  products: ProductRow[];
}

@Injectable()
export class ManufacturerService {
  constructor(private readonly db: DatabaseService) {}

  /** All manufacturers with how many products each makes (helps discover valid ids). */
  listAll(): ManufacturerSummary[] {
    return this.db.query<ManufacturerSummary>(
      `SELECT m.id, m.code, m.name, COUNT(p.id) AS productCount
         FROM Manufacturer m
         LEFT JOIN Product p ON p.manufacturerId = m.id
        GROUP BY m.id, m.code, m.name
        ORDER BY m.name`,
    );
  }

  /**
   * Products made by a manufacturer. Temporary placeholder for the future
   * vector-search query. Throws 404 if the manufacturer id does not exist;
   * an empty product list is a valid result.
   */
  getProducts(manufacturerId: number): ManufacturerProductsResult {
    const manufacturer = this.db.get<ManufacturerRef>(
      'SELECT id, code, name FROM Manufacturer WHERE id = ?',
      [manufacturerId],
    );
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer ${manufacturerId} not found`);
    }

    const products = this.db.query<ProductRow>(
      `SELECT id, sku, name, category, ingredients, description
         FROM Product
        WHERE manufacturerId = ?
        ORDER BY name`,
      [manufacturerId],
    );

    return { manufacturer, products };
  }
}
