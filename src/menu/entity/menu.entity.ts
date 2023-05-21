import { ArticleEntity } from 'src/article/entity/article.entity'
import { BaseEntity } from 'src/common/entity/base.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  JoinColumn,
  ManyToOne,
  TreeChildren,
  TreeParent,
  TreeLevelColumn,
  Tree,
} from 'typeorm'

@Entity('menu')
@Tree('closure-table', {
  closureTableName: 'menu',
  ancestorColumnName: column => 'parent_' + column.propertyName,
  descendantColumnName: column => 'children_' + column.propertyName,
})
export class MenuEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ nullable: false, type: 'json' })
  name: string
  @Column({ nullable: false })
  link: string
  @Column({ default: true })
  isActive: boolean

  @Column({ name: 'soft_deleted', default: false })
  softDeleted: boolean
  @Column({ default: 0 })
  priority: number

  @OneToMany(() => ArticleEntity, article => article.menu, {
    cascade: ['insert', 'update'],
  })
  articles: ArticleEntity[]

  @TreeChildren()
  children: MenuEntity[]

  @TreeParent()
  parent: MenuEntity
}
