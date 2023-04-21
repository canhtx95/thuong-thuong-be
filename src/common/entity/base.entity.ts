
import {
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
  } from 'typeorm';

export class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Index({ unique: true })
    uuid: string;
    @CreateDateColumn({ name: 'Created_At', type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'Updated_At', type: 'timestamp' })
    updatedAt: Date;
}