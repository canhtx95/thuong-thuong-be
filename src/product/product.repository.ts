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

  async getProductsByCategory (id: any[]): Promise<ProductEntity[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin(
        'product.category',
        'cate',
        'cate.softDeleted = false AND cate.id IN (:categoryId)',{categoryId: id,}
      )
      .select([
        'product.id',
        'product.name',
        'product.link',
        'product.otherLanguage',
        'product.description',
        'product.isActive',
      ])
      .getMany()
    return products
  }
  async getProductDetail (dto: GetProductDetailDto): Promise<any> {
    let product = await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect(
        'product.category',
        'category',
        'category.softDeleted = false AND category.isActive = true',
      )
      .leftJoinAndSelect(
        'product.content',
        'content',
        'content.language =:language',
        { language: dto.language },
      )
      .select([
        'product.id',
        'product.name',
        'product.link',
        'product.imgLink',
        'product.description',
        'product.otherLanguage',
        'product.name',
        'category.id',
        'category.name',
        'category.link',
        'category.parent',
        'content',
      ])

      .where('product.softDeleted = false AND product.isActive = true')
      .andWhere('(product.link =:link OR product.id =:id)', {
        link: dto.productLink,
        id: dto.productId,
      })
      .getOne()

    return product
  }
  async adminGetProductDetail (dto: GetProductDetailDto): Promise<any> {
    let product = await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect(
        'product.category',
        'category',
        'category.softDeleted = false',
      )
      .leftJoinAndSelect('product.content', 'content')
      .where('product.softDeleted = false')
      .andWhere('(product.link =:link OR product.id =:id)', {
        link: dto.productLink,
        id: dto.productId,
      })
      .getOne()

    return product
  }
}
