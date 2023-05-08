import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuEntity } from "src/menu/entity/menu.entity";
import { ArticleContentEntity } from "./article-content.entity";
import { Exclude } from "class-transformer";
import { BaseEntity } from "src/common/entity/base.entity";
@Entity({ name: 'article' })
export class ArticleEntity  extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Index({ unique: true })
    id: number;
    @Column({ nullable: false })
    name: string;
    @Column({ nullable: false })
    link: string;
    @Column({ default: true })
    isActive: boolean;
    @Column({ name: 'soft_deleted', default: false })
    softDeleted: boolean;

    @Column({ name: 'menu_id' })
    menuId: number;
    @ManyToOne(() => MenuEntity, (menu) => menu.articles)
    @JoinColumn({ name: 'menu_id' })
    menu: MenuEntity;


    @OneToMany(
        () => ArticleContentEntity,
        (content) => content.article,
        { cascade: ['insert'] })
    content: ArticleContentEntity[];
}