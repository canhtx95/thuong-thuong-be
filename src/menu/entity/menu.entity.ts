import { BaseEntity } from 'src/common/entity/base.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    OneToMany,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

@Entity('menu')
export class MenuEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Index({ unique: true })
    id: number;
    @Column({ nullable: false })
    name: string;
    @Column({ nullable: false })
    link: string;
    @Column({ default: true })
    isActive: boolean;
    @Column({ name: 'parent_id', nullable: true })
    parentId: number
    @Column({ name: 'other_language', default: '' })
    otherLanguage: string;
    @Column({ name: 'soft_deleted', default: false })
    softDeleted: boolean;
    @Column({ default: 0 })
    priority: number;

    @OneToMany((type) => MenuEntity, menu => menu.parent)
    subMenu: MenuEntity[];

    @ManyToOne((type) => MenuEntity, menu => menu.subMenu)
    @JoinColumn({ name: 'parent_id' })
    parent: MenuEntity

}