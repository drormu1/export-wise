import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from './country.entity';
import { Manufacturer } from './manufacturer.entity';
import { Product } from './product.entity';

/**
 * A license request: a manufacturer asking to export a product to a country.
 * decisionStatus: 'אושר' | 'נדחה' | 'אושר בתנאים'
 */
@Entity()
export class CommitteeDecision {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  manufacturerId!: number;

  @ManyToOne(() => Manufacturer)
  @JoinColumn({ name: 'manufacturerId' })
  manufacturer!: Manufacturer;

  @Index()
  @Column()
  productId!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Index()
  @Column()
  countryId!: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId' })
  country!: Country;

  @Index()
  @Column()
  decisionStatus!: string;

  @Column({ nullable: true })
  decisionReason?: string;

  @Column({ nullable: true })
  conditions?: string;

  @Column({ nullable: true })
  risks?: string;

  @Index()
  @Column()
  decisionDate!: string;
}
