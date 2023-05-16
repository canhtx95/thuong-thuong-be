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
import { language } from 'src/common/constant'
import { CustomCategoryRepository } from 'src/category/category.repository'

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
  ) {
    super()
  }

  async getProductDetail (dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      const products = await this.customProductRepository.getProductDetail(dto)
      // Kiểm tra danh mục cha có đang hoạt động hay không
      if (!products) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }
      const parentId = products?.category?.parent?.split('/')
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
        )
      if (checkParentInActive == true) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }

      const categoryName = this.getNameMultiLanguage(
        dto.language,
        products.category.otherLanguage,
      )
      products.category.name = categoryName ? categoryName : products.name
      delete products.category.otherLanguage

      const productName = this.getNameMultiLanguage(
        dto.language,
        products.otherLanguage,
      )
      products.name = productName ? productName : products.name
      const content = this.getContentMultiLanguage(
        dto.language,
        products.content,
      )
      delete products.otherLanguage
      const response = new BaseResponse('Thành công', {
        ...products,
        content,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetProductDetail (dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      dto.language = language.VIETNAMESE
      const products = await this.customProductRepository.adminGetProductDetail(
        dto,
      )
      if (!products) {
        throw new BadRequestException('Sản phảm này không tồn tại')
      }

      const response = new BaseResponse('Thành công', products)
      return response
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
      const subCate = await this.customCategoryRep.findSubCategoryById(
        category.id,
      )
      const subCateId = subCate.filter(e => e.isActive == true).map(e => e.id)
      subCateId.push(category.id)
      const products = await this.customProductRepository.getProductsByCategory(
        subCateId,
      )

      const categoryName = this.getNameMultiLanguage(
        dto.language,
        category.otherLanguage,
      )
      category.name = categoryName ? categoryName : category.name
      delete category.otherLanguage
      delete category.isActive
      delete category.parent
      delete category.isHighlight

      products.filter(p => {
        const name = this.getNameMultiLanguage(dto.language, p.otherLanguage)
        p.name = name ? name : p.name
        delete p.otherLanguage
        delete p.isActive

        return p.isActive == true
      })
      const response = new BaseResponse('Thành công', { category, products })
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
      const parentId = category.parent.split('/')

        const checkParentInActive = await this.categoryRepository
        .createQueryBuilder('cate')
        .where('cate.softDeleted = true')
        .andWhere('cate.id IN (:id)', { id: parentId })
        .getMany()
  
      if (checkParentInActive.length > 0) {
        throw new BadRequestException('Danh mục này không tồn tại')
      }
      const subCate = await this.customCategoryRep.findSubCategoryById(
        category.id,
      )
      const subCateId = subCate.map(e => e.id)
      subCateId.push(category.id)
      const products = await this.customProductRepository.getProductsByCategory(
        subCateId,
      )
      category.products = products

      const response = new BaseResponse('Thành công', category)
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
      let product = new ProductEntity()
      product = plainToClass(ProductEntity, dto)
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
