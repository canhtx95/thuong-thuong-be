import { CategoryEntity } from 'src/category/entity/category.entity';
import { BaseEntity } from 'src/common/entity/base.entity';
import { ProductContentEntity } from 'src/product/entity/product-content.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number;
  @Column()
  name: string;
  @Column()
  link: string;
  @Column({ name: 'other_language', default: '' })
  otherLanguage: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ nullable: true })
  price: number;
  @Column({ name: 'soft_deleted', default: false })
  softDeleted: boolean;
  @Column({ name: 'img_link', nullable: true })
  imgLink: boolean;

  @Column({ name: 'category_id' })
  categoryId: boolean;
  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(
    () => ProductContentEntity,
    (content) => content.product, { cascade: ['insert', 'update'] }
  )
  content: ProductContentEntity;

}
