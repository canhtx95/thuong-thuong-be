import { Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleController } from './article.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArticleEntity } from './entity/article.entity'
import { ArticleContentEntity } from './entity/article-content.entity'
import { MenuEntity } from 'src/menu/entity/menu.entity'
import { CategoryService } from 'src/category/category.service'
import { MenuService } from 'src/menu/menu.service'
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager'

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, ArticleContentEntity, MenuEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, MenuService, DatabaseTransactionManagerService],
})
export class ArticleModule {}
