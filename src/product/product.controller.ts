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
} from '@nestjs/common'

import { BaseResponse } from 'src/common/response/base.response'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { GetProductsDto } from './dto/get-product.dto'
import { GetProductDetailDto } from './dto/get-product-detail.dto'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard'
import { FileInterceptorProduct } from 'src/config/upload-image.config'

@ApiTags('Sản phẩm')
@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor (private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Thêm sản phẩm' })
  @Post('create')
  async createProducts (@Body() dto: CreateProductDto): Promise<BaseResponse> {
    return this.productService.addProducts(dto)
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo category' })
  @PublicEndpoint()
  @Post('')
  async getProducts (@Body() dto: GetProductsDto): Promise<BaseResponse> {
    return this.productService.getProductsByCategory(dto)
  }

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm theo category - quyền admin',
  })
  @Post('admin-get-products')
  async adminGetProducts (@Body() dto: GetProductsDto): Promise<BaseResponse> {
    return this.productService.adminGetProductsByCategory(dto)
  }

  @ApiOperation({ summary: 'Xem chi tiết' })
  @PublicEndpoint()
  @Post('detail')
  async getProductDetail (
    @Body() dto: GetProductDetailDto,
  ): Promise<BaseResponse> {
    return this.productService.getProductDetail(dto)
  }

  @ApiOperation({ summary: 'Xem chi tiết' })
  @Post('admin-get-detail')
  async adminGetProductDetail (
    @Body() dto: GetProductDetailDto,
  ): Promise<BaseResponse> {
    return this.productService.adminGetProductDetail(dto)
  }

  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @Post('update')
  async updateProducts (@Body() dto: UpdateProductDto): Promise<BaseResponse> {
    return this.productService.updateProducts(dto)
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái sản phẩm' })
  @Post('update-status')
  async updateProductStatus (
    @Body() dto: UpdateStatusDto,
  ): Promise<BaseResponse> {
    return this.productService.updateProductStatus(dto)
  }

  @ApiOperation({ summary: 'upload image for Product' })
  @Post('upload')
  @UseInterceptors(FileInterceptorProduct)
  async uploadProductImage (
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<any> {
    return files
  }
  @Delete(':id')
  removeProduct (@Param('id') id: number) {
    return this.productService.removeProduct(+id)
  }
}
