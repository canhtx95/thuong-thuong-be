import { CategoryEntity } from 'src/category/entity/category.entity'
import { BaseEntity } from 'src/common/entity/base.entity'
import { OrderEntity } from 'src/order/entities/order.entity'
import { ProductContentEntity } from 'src/product/entity/product-content.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm'

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column()
  name: string
  @Column()
  link: string
  @Column({ default: true })
  isActive: boolean
  @Column({ nullable: true })
  price: number
  @Column({ name: 'soft_deleted', default: false })
  softDeleted: boolean
  @Column({ name: 'img_link', nullable: true })
  imgLink: boolean

  @Column({ name: 'category_id' })
  categoryId: string
  @ManyToOne(() => CategoryEntity, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity

  @OneToMany(() => ProductContentEntity, content => content.product, {
    cascade: ['insert', 'update'],
  })
  content: ProductContentEntity[]

  @OneToOne(() => OrderEntity, order => order.product, {
    cascade: ['insert', 'update', 'remove', 'soft-remove'],
  })
  order: OrderEntity
}
