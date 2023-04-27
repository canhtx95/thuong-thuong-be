import { CategoryEntity } from 'src/category/entity/category.entity';
import { BaseEntity } from 'src/common/entity/base.entity';
import { ProductEntity } from 'src/product/entity/product.entity';
import { Type } from 'class-transformer';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'product_content' })
export class ProductContentEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number;
  @Column({ default: 'VI' })
  language: string;
  @Column({ type: 'text' })
  content: string;
  @Column({ name: 'product_id' })
  productId: number;
  @ManyToOne(() => ProductEntity, (product) => product.content)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity[];

}
