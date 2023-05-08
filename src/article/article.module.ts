import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { ArticleContentEntity } from './entity/article-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, ArticleContentEntity])],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule { }
