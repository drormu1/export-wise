import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private readonly manufacturers: ManufacturerService) {}

  /** GET /manufacturers -> { manufacturers: [{ id, code, name, productCount }] } */
  @Get()
  async list() {
    return { manufacturers: await this.manufacturers.listAll() };
  }

  /** GET /manufacturers/:id/products -> { manufacturer, products } (404 if id unknown). */
  @Get(':id/products')
  products(@Param('id', ParseIntPipe) id: number) {
    return this.manufacturers.getProducts(id);
  }
}
