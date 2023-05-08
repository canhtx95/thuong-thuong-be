import { Controller, Post, Get, Body, Patch, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { BaseResponse } from 'src/common/response/base.response';
import { getCategoryDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard';

@ApiTags('Danh mục sản phẩm - category')
@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: 'Tạo mới category' })
  @Post('create')
  createCategory(@Body() dto: CreateCategoryDto): Promise<BaseResponse> {
    return this.categoryService.createCategory(dto);
  }
  @ApiOperation({ summary: 'Cập nhật category' })
  @Post('update')
  updateCategory(@Body() dto: UpdateCategoryDto): Promise<BaseResponse> {
    return this.categoryService.updateCategory(dto);
  }

  @ApiOperation({ summary: 'Cập nhật các trạng thái category' })
  @Post('update-status')
  updateCategoryStatus(@Body() dto: UpdateCategoryStatusDto): Promise<BaseResponse> {
    return this.categoryService.updateCategoryStatus(dto);
  }

  @ApiOperation({ summary: 'Lấy hết category' })
  @PublicEndpoint()
  @Post('')
  getCategory(@Body() dto: getCategoryDto): Promise<BaseResponse> {
    return this.categoryService.getAllCategories(dto);
  }

  @Post('get-one')
  // @PublicEndpoint()
  getOneCategory(@Body() dto: getCategoryDto): Promise<BaseResponse> {
    return this.categoryService.getOneCategory(dto);
  }
}
