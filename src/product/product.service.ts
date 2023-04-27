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
import { UpdateProductStatusDto } from './dto/update-product-status.dto'
import { ProductContentEntity } from 'src/product/entity/product-content.entity'
import { GetProductsDto } from './dto/get-product.dto'
import { GetProductDetailDto } from './dto/get-product-detail.dto'
import { CustomProductRepository } from './product.repository'


@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly customProductRepository: CustomProductRepository,
        private readonly managerTransaction: DatabaseTransactionManagerService,
    ) { }

    async getProductDetail(dto: GetProductDetailDto): Promise<BaseResponse> {
        try {
            const products = await this.customProductRepository.getProductDetail(dto)
            const response = new BaseResponse('Thành công', products)
            return response
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
    async getProducts(dto: GetProductsDto): Promise<BaseResponse> {
        try {
            const products = await this.productRepository.find()

            const response = new BaseResponse('Thành công', products)
            return response
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async addProducts(dto: CreateProductDto): Promise<BaseResponse> {
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
    async updateProducts(dto: UpdateProductDto): Promise<BaseResponse> {
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
            const content = product.content;
            const productSaved = await categoryRepositoryTransaction.save(product)
            const productContentRepository = queryRunner.manager.getRepository(ProductContentEntity)
            productContentRepository.save(content)
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

    async updateProductStatus(
        dto: UpdateProductStatusDto,
    ): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction()
        try {
            const categoryRepositoryTransaction =
                queryRunner.manager.getRepository(ProductEntity)
            let product = new ProductEntity()
            product = plainToClass(ProductEntity, dto)
            const productSaved = await categoryRepositoryTransaction.save(product)
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
}
