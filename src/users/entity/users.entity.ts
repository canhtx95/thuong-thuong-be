import { BaseEntity } from 'src/common/entity/base.entity';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  uuid: string;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
}
