import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { CategoryEntity } from './entity/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomCategoryRepository } from './category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    DatabaseTransactionManagerService,
    CustomCategoryRepository,
  ],
  exports:[CategoryService]
})
export class CategoryModule {}
