import { Controller, Post, Get, Body, Patch } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { BaseResponse } from 'src/common/response/base.response';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { getCategoryDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: 'Tạo mới category' })
  @Post('create')
  createCategory(@Body() dto: CreateCategoryDto): Promise<BaseResponse> {
    return this.categoryService.createCategory(dto);
  }
  @ApiOperation({ summary: 'update category' })
  @Post('update')
  updateCategory(@Body() dto: UpdateCategoryDto): Promise<BaseResponse> {
    return this.categoryService.updateCategory(dto);
  }

  @ApiOperation({ summary: 'update category' })
  @Post('update-status')
  updateCategoryStatus(@Body() dto: UpdateCategoryStatusDto): Promise<BaseResponse> {
    return this.categoryService.updateCategoryStatus(dto);
  }

  @ApiOperation({ summary: 'get All category' })
  @Post('')
  getCategory(): Promise<BaseResponse> {
    return this.categoryService.getAllCategories();
  }
  @Post('get-one')
  getOneCategory(@Body() dto: getCategoryDto): Promise<BaseResponse> {
    return this.categoryService.getOneCategory(dto);
  }
}
