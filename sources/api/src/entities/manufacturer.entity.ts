import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Manufacturer {
  @PrimaryGeneratedColumn()
  id!: number;

  // Short unique prefix used in product SKUs, e.g. 'TNV' for Tnuva.
  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @OneToMany(() => Product, (product) => product.manufacturer)
  products!: Product[];
}
