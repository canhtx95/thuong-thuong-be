import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entity/product.entity';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { CustomProductRepository } from './product.repository';
import { CategoryEntity } from 'src/category/entity/category.entity';
import { ProductContentEntity } from './entity/product-content.entity';
import { CustomCategoryRepository } from 'src/category/category.repository';
import { CategoryService } from 'src/category/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, ProductContentEntity])],
  controllers: [ProductController],
  providers: [ProductService,
    DatabaseTransactionManagerService,
    CustomProductRepository,
    CustomCategoryRepository,
    CategoryService]
})
export class ProductModule { }
