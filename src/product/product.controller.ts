import { Controller, Post, Get, Body, Patch } from '@nestjs/common';

import { BaseResponse } from 'src/common/response/base.response';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { GetProductsDto } from './dto/get-product.dto';
import { GetProductDetailDto } from './dto/get-product-detail.dto';
@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @ApiOperation({ summary: 'add products' })
  @Post('create')
  async createProducts(@Body() dto: CreateProductDto): Promise<BaseResponse> {
    return this.productService.addProducts(dto);
  }

  @ApiOperation({ summary: 'get products by id, link, categoryId' })
  @Post('')
  async getProducts(@Body() dto: GetProductsDto): Promise<BaseResponse> {
    return this.productService.getProducts(dto);
  }

  @ApiOperation({ summary: 'get product detail by id, link' })
  @Post('detail')
  async getProductDetail(@Body() dto: GetProductDetailDto): Promise<BaseResponse> {
    return this.productService.getProductDetail(dto);
  }


  @ApiOperation({ summary: 'update Products' })
  @Post('update')
  async updateProducts(@Body() dto: UpdateProductDto): Promise<BaseResponse> {
    return this.productService.updateProducts(dto);
  }

  @ApiOperation({ summary: 'update Products status' })
  @Post('update-status')
  async updateProductStatus(@Body() dto: UpdateProductStatusDto): Promise<BaseResponse> {
    return this.productService.updateProductStatus(dto);
  }

  @ApiOperation({ summary: 'upload image for Product' })
  @Post('upload')
  async uploadProductImage(): Promise<BaseResponse> {
    return null;
  }



}
