import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";
import { MenuEntity } from "src/menu/entity/menu.entity";
import { ArticleContentEntity } from "./article-content.entity";
import { Exclude } from "class-transformer";
import { BaseEntity } from "src/common/entity/base.entity";
@Entity({ name: 'article' })
export class ArticleEntity {
    @PrimaryGeneratedColumn()
    @Index({ unique: true })
    id: number;
    name: string;
    @Column({ nullable: false })
    link: string;
    @Column({ default: true })
    isActive: boolean;
    @Column({ name: 'soft_deleted', default: false })
    softDeleted: boolean;
    @Column({ name: 'img_link', nullable: true })
    imgLink: string
    @Column({ name: 'menu_id' })
    menuId: number;
    @ManyToOne(() => MenuEntity, (menu) => menu.articles)
    @JoinColumn({ name: 'menu_id' })
    menu: MenuEntity;
    description?: string;


    @OneToMany(
        () => ArticleContentEntity,
        (content) => content.article,
        { cascade: ['insert','update'] })
    content: ArticleContentEntity[];


    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;


}