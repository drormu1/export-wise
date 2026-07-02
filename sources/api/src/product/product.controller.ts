import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  /**
   * GET /products/search?q=&category=&manufacturerId=
   * -> { query, count, products: [{ ..., manufacturer }] }
   */
  @Get('search')
  async search(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('manufacturerId') manufacturerId?: string,
  ) {
    const products = await this.products.search(
      q,
      category,
      manufacturerId ? Number(manufacturerId) : undefined,
    );
    return { query: q ?? '', count: products.length, products };
  }
}
