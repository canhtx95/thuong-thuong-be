import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProductEntity } from './entity/product.entity'
import { Repository } from 'typeorm'
import { GetProductsDto } from './dto/get-product.dto'
import { GetProductDetailDto } from './dto/get-product-detail.dto'
import { CategoryEntity } from 'src/category/entity/category.entity'
import { DataSource } from 'typeorm'
import { ProductContentEntity } from './entity/product-content.entity'
import { Pagination } from 'src/common/service/pagination.service'
import { ROLE } from 'src/common/constant'
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

  async getProductsByCategory (
    id: any[],
    paging: Pagination,
    language: string,
    role?: string,
  ): Promise<[ProductEntity[], number]> {
    const createQueryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.content', 'content')
      .select([
        'product.id',
        'product.link',
        'product.isActive',
        'product.softDeleted',
        'product.imageUrl',
        'content',
      ])
      .where('1=1')
      .andWhere('product.categoryId IN (:id)', { id: id })
      .andWhere('content.language = :language', { language: language })

    if (role == ROLE.ADMIN) {
      createQueryBuilder.andWhere('product.softDeleted = false')
    } else {
      createQueryBuilder
        .andWhere('product.softDeleted = false')
        .andWhere('product.isActive = true')
    }
    const products = await createQueryBuilder
      .skip(paging.skip)
      .take(paging.size)
      .getManyAndCount()
    return products
  }
  async getProductDetail (dto: GetProductDetailDto): Promise<any> {
    const language = dto.language.toUpperCase()
    let product = await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect(
        'product.category',
        'category',
        'category.softDeleted = false AND category.isActive = true',
      )
      .innerJoinAndSelect(
        'product.content',
        'content',
        'content.language =:language',
        { language: language },
      )
      .select([
        'product.id',
        'product.link',
        'product.imageUrl',
        'product.createdAt',
        'product.updatedAt',
        'category.id',
        'category.name',
        'category.link',
        'content',
      ])

      .where('(product.softDeleted = false AND product.isActive = true)')
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
        '(category.softDeleted = false)',
      )
      .innerJoinAndSelect('product.content', 'content')
      .where('(product.softDeleted = false)')
      .andWhere('(product.link =:link OR product.id =:id)', {
        link: dto.productLink,
        id: dto.productId,
      })
      .getOne()

    return product
  }

  async checkParentCategoriesInActive (
    id: any[],
    role?: string,
  ): Promise<boolean> {
    const createQueryBuilder = this.categoryRepository
      .createQueryBuilder('cate')
      .where('cate.id IN (:id)', { id: id })

    if (role == ROLE.ADMIN) {
      createQueryBuilder.andWhere('(cate.softDeleted = true)')
    } else {
      createQueryBuilder.andWhere(
        '(cate.softDeleted = true OR cate.isActive = false)',
      )
    }
    const result = await createQueryBuilder.getMany()
    return result.length > 0 ? true : false
  }
}
