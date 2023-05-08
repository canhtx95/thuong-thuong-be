import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity({ name: 'article_content' })
export class ArticleContentEntity {
    @PrimaryGeneratedColumn()
    @Index({ unique: true })
    id: number;
    @Column({ default: 'VI' })
    language: string;
    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'article_id' })
    articleId: number;

    @ManyToOne(() => ArticleEntity, (article) => article.content)
    @JoinColumn({ name: 'article_id' })
    article: ArticleEntity;

}