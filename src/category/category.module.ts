import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { CategoryEntity } from './entity/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomCategoryRepository } from './category.repository';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserEntity } from 'src/users/entity/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, UserEntity])],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    DatabaseTransactionManagerService,
    CustomCategoryRepository
  ],
  exports: [CategoryService]
})
export class CategoryModule { }
