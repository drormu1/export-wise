import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  /**
   * Exact (SQL) product search: free-text match across product name, category and
   * manufacturer name, plus optional category / manufacturerId filters. Deterministic —
   * no AI. The manufacturer is joined in so the client can show who makes each product.
   */
  async search(q?: string, category?: string, manufacturerId?: number): Promise<Product[]> {
    const qb = this.products
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.manufacturer', 'm');

    const term = q?.trim();
    if (term) {
      const like = `%${term}%`;
      qb.andWhere('(p.name LIKE :like OR p.category LIKE :like OR m.name LIKE :like)', { like });
    }
    if (category) {
      qb.andWhere('p.category = :category', { category });
    }
    if (manufacturerId) {
      qb.andWhere('p.manufacturerId = :manufacturerId', { manufacturerId });
    }

    return qb.orderBy('p.name', 'ASC').limit(100).getMany();
  }
}
