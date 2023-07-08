import {
  UseGuards,
  Controller,
  Post,
  Get,
  Body,
  UploadedFiles,
  UseInterceptors,
  Delete,
  Param,
  Req,
  Query,
  UploadedFile,
} from '@nestjs/common';

import { BaseResponse } from 'src/common/response/base.response';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-product.dto';
import { GetProductDetailDto } from './dto/get-product-detail.dto';
import { UpdateStatusDto } from 'src/common/dto/update-status.dto';
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard';
import { FileInterceptorProduct } from 'src/config/upload-image.config';
import { SearchDto } from '../common/dto/search.dto';
import { ROLE } from 'src/common/constant';
import { join } from 'path';

@ApiTags('Sản phẩm')
@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Thêm sản phẩm' })
  @Post('admin/create')
  async createProducts(@Body() dto: CreateProductDto): Promise<BaseResponse> {
    return this.productService.addProducts(dto);
  }

  //API để search, get luôn
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo category' })
  @PublicEndpoint()
  @Post('')
  async getProducts(@Body() dto: GetProductsDto): Promise<BaseResponse> {
    return this.productService.getProductsByCategory(dto);
  }

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm theo category - quyền admin',
  })
  @Post('admin/get-products')
  async adminGetProducts(@Body() dto: GetProductsDto): Promise<BaseResponse> {
    return this.productService.adminGetProductsByCategory(dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @PublicEndpoint()
  @Get('get-all')
  async getAllProducts(@Query() dto: SearchDto): Promise<BaseResponse> {
    return this.productService.getAllProduct(dto);
  }

  @ApiOperation({
    summary: 'Lấy tất cả sản phẩm quyền admin',
  })
  @Get('admin/get-all')
  async adminGetAllProducts(@Query() dto: SearchDto): Promise<BaseResponse> {
    return this.productService.adminGetAllProducts(dto);
  }

  @ApiOperation({ summary: 'Xem chi tiết' })
  @PublicEndpoint()
  @Get('detail')
  async getProductDetail(
    @Query() dto: GetProductDetailDto,
  ): Promise<BaseResponse> {
    return this.productService.getProductDetail(dto);
  }

  @ApiOperation({ summary: 'Xem chi tiết - quyền admin' })
  @Get('admin/get-detail')
  async adminGetProductDetail(
    @Query() dto: GetProductDetailDto,
  ): Promise<BaseResponse> {
    return this.productService.adminGetProductDetail(dto);
  }

  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @Post('admin/update')
  async updateProducts(@Body() dto: UpdateProductDto): Promise<BaseResponse> {
    return this.productService.updateProducts(dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái sản phẩm' })
  @Post('admin/update-status')
  async updateProductStatus(
    @Body() dto: UpdateStatusDto,
  ): Promise<BaseResponse> {
    return this.productService.updateProductStatus(dto);
  }

  // @ApiOperation({ summary: 'Seach product' })
  // @PublicEndpoint()
  // @Post('search')
  // async searchProducts (@Body() dto: SearchDto): Promise<BaseResponse> {
  //   return this.productService.searchProduct(dto)
  // }

  // @ApiOperation({ summary: 'Seach product - quyền admin' })
  // @Post('admin/search')
  // async adminSearchProducts (@Body() dto: SearchDto): Promise<BaseResponse> {
  //   return this.productService.adminSearchProduct(dto)
  // }

  @ApiOperation({ summary: 'upload image for Product' })
  @Post('admin/upload')
  @PublicEndpoint()
  @UseInterceptors(FileInterceptorProduct)
  async uploadProductImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ): Promise<any> {
    return files[0];
  }
  @Delete('admin/:id')
  removeProduct(@Param('id') id: number) {
    return this.productService.removeProduct(+id);
  }
}
