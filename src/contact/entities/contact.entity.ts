import { STATUS } from 'src/common/constant'
import { BaseEntity } from 'src/common/entity/base.entity'
import { ProductEntity } from 'src/product/entity/product.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm'

@Entity({ name: 'contact' })
export class Contact extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ nullable: false })
  name: string
  @Column({ nullable: true })
  email: string
  @Column({ nullable: false })
  phone: string
  @Column({ nullable: false, default: STATUS.CHUA_XU_LY })
  status: number
}
