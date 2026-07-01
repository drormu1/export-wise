import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  // Unique SKU in format {manufacturerCode}-{number}, e.g. 'TNV-001'.
  @Column({ unique: true })
  sku!: string;

  @Index()
  @Column()
  manufacturerId!: number;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products)
  @JoinColumn({ name: 'manufacturerId' })
  manufacturer!: Manufacturer;

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ nullable: true })
  ingredients?: string;

  @Column({ nullable: true })
  description?: string;
}
