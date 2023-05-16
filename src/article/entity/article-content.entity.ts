import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { ArticleEntity } from './article.entity'
import { language } from 'src/common/constant'

@Entity({ name: 'article_extensions' })
export class ArticleContentEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ default: language.VIETNAMESE })
  language: string
  @Column()
  name: string
  @Column({ type: 'text' })
  content: string
  @Column()
  description: string
  @Column({ name: 'article_id' })
  articleId: number

  @ManyToOne(() => ArticleEntity, article => article.content)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity
}
