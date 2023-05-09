import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProductEntity } from './entity/product.entity'
import { Repository } from 'typeorm'
import { GetProductsDto } from './dto/get-product.dto'
import { GetProductDetailDto } from './dto/get-product-detail.dto'
import { CategoryEntity } from 'src/category/entity/category.entity'
import { DataSource } from 'typeorm'
import { ProductContentEntity } from './entity/product-content.entity'
@Injectable()
export class CustomProductRepository {
  constructor (
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductContentEntity)
    private readonly contentRepository: Repository<ProductContentEntity>,
    private dataSource: DataSource,
  ) {}

  async getProductsByCategory (dto: GetProductsDto): Promise<any> {
    const products = await this.categoryRepository
      .createQueryBuilder('cate')
      .leftJoinAndSelect('cate.products', 'product')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'product.id',
        'product.name',
        'product.link',
        'product.otherLanguage',
      ])
      .where(`cate.id=:categoryId OR cate.link=:categoryLink`, {
        categoryId: dto.categoryId,
        categoryLink: dto.categoryLink,
      })
      .getOne()
    return products
  }
  async getProductDetail (dto: GetProductDetailDto): Promise<any> {
    let product = await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.content', 'content')
      .andWhere('product.link =:link OR product.id =:id', {
        link: dto.productLink,
        id: dto.productId,
      })
      .andWhere('content.language =:language', { language: dto.language })
      .getOne()
    if (product) {
      product.category.softDeleted == true || product.softDeleted == true
        ? null
        : product
    }
    return product
  }
}
