import { ROLE } from 'src/common/constant'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  uuid: string
  @Column({ unique: true })
  username: string
  @Column()
  password: string
  @Column({ default: ROLE.ADMIN })
  role: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
