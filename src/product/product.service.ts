import { ProductEntity } from './entity/product.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateProductDto } from './dto/create-product.dto'
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager'
import { plainToClass } from 'class-transformer'
import { BaseResponse } from 'src/common/response/base.response'
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductContentEntity } from 'src/product/entity/product-content.entity'
import { GetProductsDto } from './dto/get-product.dto'
import { GetProductDetailDto } from './dto/get-product-detail.dto'
import { CustomProductRepository } from './product.repository'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { CategoryEntity } from 'src/category/entity/category.entity'
import { CommonService } from 'src/common/service/service.common'
import { ROLE } from 'src/common/constant'
import { CustomCategoryRepository } from 'src/category/category.repository'
import { Pagination } from 'src/common/service/pagination.service'
import { SearchDto } from '../common/dto/search.dto'
import { CategoryService } from 'src/category/category.service'

@Injectable()
export class ProductService extends CommonService {
  constructor (
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly customProductRepository: CustomProductRepository,
    private readonly managerTransaction: DatabaseTransactionManagerService,
    private readonly customCategoryRep: CustomCategoryRepository,
    private readonly categoryService: CategoryService,
  ) {
    super()
  }

  async getProductDetail (dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      const product = await this.customProductRepository.getProductDetail(dto)
      // Kiểm tra danh mục cha có đang hoạt động hay không
      if (!product) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }
      const parentId = product?.category?.parent?.split('/')
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
        )
      if (checkParentInActive == true) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }

      const categoryName = this.getNameMultiLanguage(
        dto.language,
        product.category.name,
      )
      product.category.name = categoryName
        ? categoryName
        : product.category.name
      delete product.category.parent

      const extensions = product.content[0]
      return new BaseResponse('Thành công', {
        ...product,
        name: extensions.name,
        description: extensions.description,
        content: extensions.content,
      })
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetProductDetail (dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      const product = await this.customProductRepository.adminGetProductDetail(
        dto,
      )
      // Kiểm tra danh mục cha có đang hoạt động hay không
      if (!product) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }
      const parentId = product?.category?.parent?.split('/')
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
          ROLE.ADMIN,
        )
      if (checkParentInActive == true) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }
      return new BaseResponse('Thành công', product)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getProductsByCategory (dto: GetProductsDto): Promise<BaseResponse> {
    try {
      const category = await this.customCategoryRep.findCategoryByIdOrLink(
        dto.categoryId,
        dto.categoryLink,
      )
      if (!category || category.isActive == false) {
        throw new BadRequestException('Danh mục này không tồn tại')
      }
      // Kiểm tra danh mục cha có đang hoạt động hay không
      const parentId = category.parent.split('/')
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
        )
      if (checkParentInActive == true) {
        throw new BadRequestException('Danh mục này không tồn tại')
      }

      //Lấy tất cả các bài sản phẩm của các category cấp dưới
      const subCateId = await this.customCategoryRep
        .findSubCategoryById(category.id)
        .then(arr => arr.filter(e => e.isActive == true).map(e => e.id))
      subCateId.push(category.id)
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.customProductRepository.getProductsByCategory(
        subCateId,
        pagination,
        dto.language,
      )

      const categoryName = this.getNameMultiLanguage(
        dto.language,
        category.name,
      )
      category.name = categoryName ? categoryName : category.name
      delete category.isActive
      delete category.parent
      delete category.isHighlight

      const products = result[0].map(product => {
        const content = product.content[0]
        delete product.content
        delete product.isActive
        delete product.softDeleted
        return {
          ...product,
          name: content.name,
          description: content.description,
        }
      })
      const count = result[1]
      pagination.createResult(count)
      const response = new BaseResponse('Thành công', {
        category,
        products,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetProductsByCategory (dto: GetProductsDto): Promise<BaseResponse> {
    try {
      const category = await this.customCategoryRep.findCategoryByIdOrLink(
        dto.categoryId,
        dto.categoryLink,
      )
      if (!category) {
        throw new BadRequestException('Danh mục này không tồn tại')
      }
      // Kiểm tra danh mục cha có đang hoạt động hay không
      const parentId = category.parent.split('/')
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
          ROLE.ADMIN,
        )
      if (checkParentInActive == true) {
        throw new BadRequestException('Danh mục này không tồn tại')
      }

      //Lấy tất cả các bài sản phẩm của các category cấp dưới
      const subCateId = await this.customCategoryRep
        .findSubCategoryById(category.id)
        .then(arr => arr.map(e => e.id))
      subCateId.push(category.id)
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.customProductRepository.getProductsByCategory(
        subCateId,
        pagination,
        dto.language,
        ROLE.ADMIN,
      )
      const products = result[0].map(product => {
        const content = product.content[0]
        delete product.content
        return {
          ...product,
          name: content.name,
          description: content.description,
        }
      })
      const count = result[1]
      pagination.createResult(count)
      const response = new BaseResponse('Thành công', {
        category,
        products,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async addProducts (dto: CreateProductDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity)
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      const checkLinkProduct = await this.productRepository.findOneBy({
        link: dto.link,
      })
      if (checkLinkProduct) {
        throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại')
      }
      const product = plainToClass(ProductEntity, dto)
      const productSaved = await categoryRepositoryTransaction.save(product)
      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Thêm sản phẩm thành công',
        productSaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async updateProducts (dto: UpdateProductDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity)
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      const checkLinkProduct = await this.productRepository.findOneBy({
        link: dto.link,
      })
      if (checkLinkProduct && checkLinkProduct.id != dto.id) {
        throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại')
      }
      let product = plainToClass(ProductEntity, dto)
      const productSaved = await categoryRepositoryTransaction.save(product)
      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Cập nhật sản phẩm thành công',
        productSaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateProductStatus (dto: UpdateStatusDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const productRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity)
      const getProductDto = new GetProductDetailDto()
      getProductDto.productId = dto.id
      let isProductExisting =
        await this.customProductRepository.adminGetProductDetail(getProductDto)
      if (!isProductExisting) {
        throw new Error('Sản phẩm không tồn tại')
      }
      let product = plainToClass(ProductEntity, dto)
      const productSaved = await productRepositoryTransaction.save(product)
      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Cập nhật trạng thái sản phẩm thành công',
        productSaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  spreadOutCategory (arr: CategoryEntity[]) {
    let i = 0
    while (i < arr.length) {
      const cate = arr[i]
      if (cate.subCategories.length > 0) {
        arr.push.apply(arr, cate.subCategories)
      }
      i++
    }
    return arr.map(e => e.id)
  }

  async searchProduct (dto: SearchDto): Promise<any> {
    try {
      // lấy tất cả các category đang hoạt động
      const findRootCategories = await this.categoryService.getAllCategories(
        null,
      )
      const categoryId = this.spreadOutCategory(findRootCategories.data)
      const productQueryBuilder = this.productRepository
        .createQueryBuilder('product')
        .innerJoin(
          'product.content',
          'ext',
          'ext.language = :language AND ext.name LIKE :name',
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'product.id',
          'product.link',
          'ext.name',
          'ext.language',
          'ext.description',
        ])
        .where('product.softDeleted = false AND product.isActive = true')
        .andWhere('product.categoryId IN (:categoryId)', {
          categoryId: categoryId,
        })
      const pagination = new Pagination(dto.page, dto.size)
      const result = await productQueryBuilder
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()
      const products = result[0].map(product => {
        const ext = product.content[0]
        delete product.content
        return {
          ...product,
          name: ext.name,
          description: ext.description,
        }
      })
      pagination.createResult(result[1])
      const response = new BaseResponse('Kết quả tìm kiếm', {
        products,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminSearchProduct (dto: SearchDto): Promise<any> {
    try {
      // lấy tất cả các category đang hoạt động
      const findRootCategories =
        await this.categoryService.getAllCategoriesByAdmin()
      const categoryId = this.spreadOutCategory(findRootCategories.data)

      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.productRepository
        .createQueryBuilder('product')
        .innerJoin(
          'product.content',
          'ext',
          'ext.language = :language AND ext.name LIKE :name',
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'product.id',
          'product.link',
          'product.isActive',
          'ext.name',
          'ext.language',
          'ext.description',
        ])
        .where('product.softDeleted = false')
        .andWhere('product.categoryId IN (:categoryId)', {
          categoryId: categoryId,
        })
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()
      const products = result[0].map(product => {
        const ext = product.content[0]
        delete product.content
        return {
          ...product,
          name: ext.name,
          description: ext.description,
        }
      })
      pagination.createResult(result[1])
      const response = new BaseResponse('Kết quả tìm kiếm', {
        products,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async removeProduct (id: number): Promise<BaseResponse> {
    try {
      const products = await this.productRepository.delete(id)
      const response = new BaseResponse('Xóa thành công', products)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
