import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../entities/manufacturer.entity';
import { Product } from '../entities/product.entity';

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

export interface ManufacturerProductsResult {
  manufacturer: ManufacturerRef;
  products: Product[];
}

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer) private readonly manufacturers: Repository<Manufacturer>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  /** All manufacturers with how many products each makes (helps discover valid ids). */
  async listAll(): Promise<ManufacturerSummary[]> {
    const rows = await this.manufacturers
      .createQueryBuilder('m')
      .leftJoin(Product, 'p', 'p.manufacturerId = m.id')
      .select('m.id', 'id')
      .addSelect('m.code', 'code')
      .addSelect('m.name', 'name')
      .addSelect('COUNT(p.id)', 'productCount')
      .groupBy('m.id')
      .orderBy('m.name')
      .getRawMany<{ id: number; code: string; name: string; productCount: number }>();

    return rows.map((r) => ({
      id: Number(r.id),
      code: r.code,
      name: r.name,
      productCount: Number(r.productCount),
    }));
  }

  /**
   * Products made by a manufacturer. Temporary placeholder for the future
   * vector-search query. Throws 404 if the manufacturer id does not exist;
   * an empty product list is a valid result.
   */
  async getProducts(manufacturerId: number): Promise<ManufacturerProductsResult> {
    const manufacturer = await this.manufacturers.findOne({ where: { id: manufacturerId } });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer ${manufacturerId} not found`);
    }

    const products = await this.products.find({
      where: { manufacturerId },
      order: { name: 'ASC' },
    });

    return {
      manufacturer: { id: manufacturer.id, code: manufacturer.code, name: manufacturer.name },
      products,
    };
  }
}
