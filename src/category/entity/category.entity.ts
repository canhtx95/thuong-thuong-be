import { BaseEntity } from 'src/common/entity/base.entity';
import { ProductEntity } from 'src/product/entity/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number;
  @Column({ nullable: false })
  name: string;
  @Column({ nullable: false })
  link: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ default: '', nullable: true })
  parent: string;
  @Column({ default: false })
  isHighlight: boolean;
  @Column({ name: 'other_language', default: '' })
  otherLanguage: string;
  @Column({ name: 'soft_deleted', default: false })
  softDeleted: boolean;
  @Column({ default: 0 })
  priority: number;

  @OneToMany(() => ProductEntity, (product) => product.category, { cascade: ['insert', 'update'] })
  products: ProductEntity[];

  subCategories: CategoryEntity[] = [];
}
