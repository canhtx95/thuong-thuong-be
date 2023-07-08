import { ProductEntity } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { plainToClass } from 'class-transformer';
import { BaseResponse } from 'src/common/response/base.response';
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductContentEntity } from 'src/product/entity/product-content.entity';
import { GetProductsDto } from './dto/get-product.dto';
import { GetProductDetailDto } from './dto/get-product-detail.dto';
import { CustomProductRepository } from './product.repository';
import { UpdateStatusDto } from 'src/common/dto/update-status.dto';
import { CategoryEntity } from 'src/category/entity/category.entity';
import { CommonService } from 'src/common/service/service.common';
import { ROLE, language } from 'src/common/constant';
import { CustomCategoryRepository } from 'src/category/category.repository';
import { Pagination } from 'src/common/service/pagination.service';
import { SearchDto } from '../common/dto/search.dto';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService extends CommonService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly customProductRepository: CustomProductRepository,
    private readonly managerTransaction: DatabaseTransactionManagerService,
    private readonly customCategoryRep: CustomCategoryRepository,
    private readonly categoryService: CategoryService,
  ) {
    super();
  }

  async getProductDetail(dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      if (dto.productLink) {
        dto.productLink = dto.productLink.startsWith('/')
          ? dto.productLink
          : `/${dto.productLink}`;
      }
      const product = await this.customProductRepository.getProductDetail(dto);
      // Kiểm tra danh mục cha có đang hoạt động hay không
      if (!product) {
        throw new BadRequestException('Sản phảm này không tồn tại');
      }
      const parentId = product?.category?.parent?.split('/');
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
        );
      if (checkParentInActive == true) {
        throw new BadRequestException('Sản phảm này không tồn tại');
      }
      delete product.category;
      const extensions = product.content[0];
      return new BaseResponse('Thành công', {
        ...product,
        name: extensions.name,
        description: extensions.description,
        content: extensions.content,
        title: extensions.name,
        danhMuc1: extensions.metadata.danhMuc1,
        danhMuc2: extensions.metadata.danhMuc2,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async adminGetProductDetail(dto: GetProductDetailDto): Promise<BaseResponse> {
    try {
      const product = await this.customProductRepository.adminGetProductDetail(
        dto,
      );
      // Kiểm tra danh mục cha có đang hoạt động hay không
      if (!product) {
        throw new BadRequestException('Sản phảm này không tồn tại');
      }
      const parentId = product?.category?.parent?.split('/');
      const checkParentInActive =
        await this.customProductRepository.checkParentCategoriesInActive(
          parentId,
          ROLE.ADMIN,
        );
      if (checkParentInActive == true) {
        throw new BadRequestException('Sản phảm này không tồn tại');
      }
      delete product.category;
      const metadata = product.content[0].metadata;

      return new BaseResponse('Thành công', {
        ...product,
        title: product.name,
        categoryLevel1Id: metadata.danhMuc1.id,
        categoryLevel2Id: metadata.danhMuc2.id,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getProductsByCategory(dto: GetProductsDto): Promise<BaseResponse> {
    try {
      let category;
      let categoryIds = [];
      if (dto.categoryId == null && dto.categoryLink == null) {
        // trường hợp categoryId và categoryId trống thì sẽ lấy tất cả các sản phẩm
        categoryIds = await this.getAllCategoriesActive();
      } else {
        let categoryLink = dto.categoryLink;
        if (categoryLink && !categoryLink.startsWith('/')) {
          categoryLink = `/${dto.categoryLink}`;
        }

        category = await this.customCategoryRep.findCategoryByIdOrLink(
          dto.categoryId,
          categoryLink,
        );
        if (!category || category.isActive == false) {
          throw new BadRequestException('Danh mục này không tồn tại');
        }
        // Kiểm tra danh mục cha có đang hoạt động hay không
        const parentId = category.parent.split('/');
        const checkParentInActive =
          await this.customProductRepository.checkParentCategoriesInActive(
            parentId,
          );
        if (checkParentInActive == true) {
          throw new BadRequestException('Danh mục này không tồn tại');
        }

        //Lấy tất cả các bài sản phẩm của các category cấp dưới
        categoryIds = await this.customCategoryRep
          .findSubCategoryById(category.id)
          .then((arr) =>
            arr.filter((e) => e.isActive == true).map((e) => e.id),
          );
        categoryIds.push(category.id);
      }

      const pagination = new Pagination(dto.page, dto.size);
      const result = await this.customProductRepository.getProductsByCategory(
        categoryIds,
        pagination,
        dto.language,
        null,
        dto.productName,
      );
      // if (category) {
      //   const categoryName = this.getNameMultiLanguage(
      //     dto.language,
      //     category.name,
      //   )
      //   category.name = categoryName ? categoryName : category.name
      //   delete category.isActive
      //   delete category.parent
      //   delete category.isHighlight
      // }
      await this.handleCategoryWhenGetProduct(dto.language, category);
      const products = result[0].map((product) => {
        const content = product.content[0];
        let danhMuc1;
        let danhMuc2;
        if (content.metadata) {
          danhMuc1 = content.metadata['danhMuc1'];
          danhMuc2 = content.metadata['danhMuc2'];
        }
        delete product.content;
        delete product.isActive;
        delete product.softDeleted;
        delete product.category;
        return {
          ...product,
          name: content.name,
          title: content.name,
          description: content.description,
          danhMuc1,
          danhMuc2,
        };
      });
      const count = result[1];
      pagination.createResult(count);
      const response = new BaseResponse('Thành công', {
        category,
        products,
        pagination,
      });
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async handleCategoryWhenGetProduct(
    language: string,
    category: CategoryEntity,
  ) {
    if (category) {
      const categoryName = this.getNameMultiLanguage(language, category.name);
      category.name = categoryName ? categoryName : category.name;
      if (category.parent != '') {
        const id = category.parent.split('/').pop();
        const parentCategory = await this.customCategoryRep.getParentCategory(
          id,
        );
        const parentCategoryName = this.getNameMultiLanguage(
          language,
          parentCategory.name,
        );
        parentCategory.name = parentCategoryName;
        delete parentCategory.isActive;
        delete parentCategory.parent;
        delete parentCategory.isHighlight;
        category.parentCategory = parentCategory;
      }
      delete category.isActive;
      delete category.parent;
      delete category.isHighlight;
    }
  }
  async adminGetProductsByCategory(dto: GetProductsDto): Promise<BaseResponse> {
    try {
      let category;
      let categoryIds = [];
      if (dto.categoryId == null && dto.categoryLink == null) {
        // trường hợp categoryId và categoryId trống thì sẽ lấy tất cả các sản phẩm
        categoryIds = await this.getAllCategoriesActive();
      } else {
        let categoryLink = dto.categoryLink;
        if (categoryLink && !categoryLink.startsWith('/')) {
          categoryLink = `/${dto.categoryLink}`;
        }

        category = await this.customCategoryRep.findCategoryByIdOrLink(
          dto.categoryId,
          categoryLink,
        );
        if (!category || category.isActive == false) {
          throw new BadRequestException('Danh mục này không tồn tại');
        }
        // Kiểm tra danh mục cha có đang hoạt động hay không
        const parentId = category.parent.split('/');
        const checkParentInActive =
          await this.customProductRepository.checkParentCategoriesInActive(
            parentId,
            ROLE.ADMIN,
          );
        if (checkParentInActive == true) {
          throw new BadRequestException('Danh mục này không tồn tại');
        }

        //Lấy tất cả các bài sản phẩm của các category cấp dưới
        categoryIds = await this.customCategoryRep
          .findSubCategoryById(category.id)
          .then((arr) =>
            arr.filter((e) => e.isActive == true).map((e) => e.id),
          );
        categoryIds.push(category.id);
      }

      const pagination = new Pagination(dto.page, dto.size);
      const result = await this.customProductRepository.getProductsByCategory(
        categoryIds,
        pagination,
        dto.language,
        ROLE.ADMIN,
      );

      const products = result[0].map((product) => {
        const content = product.content[0];
        let danhMuc1;
        let danhMuc2;
        if (content.metadata) {
          danhMuc1 = content.metadata['danhMuc1'];
          danhMuc2 = content.metadata['danhMuc2'];
        }
        delete product.content;
        delete product.category;

        return {
          ...product,
          name: content.name,
          title: content.name,
          description: content.description,
          danhMuc1,
          danhMuc2,
        };
      });
      const count = result[1];
      pagination.createResult(count);
      const response = new BaseResponse('Thành công', {
        category,
        products,
        pagination,
      });
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  getCategoriesNameWhenCreateProduct(
    language: string,
    danhMuc1: CategoryEntity,
    danhMuc2: CategoryEntity,
  ) {
    const tenDanhMuc1 = danhMuc1.name;
    const tenDanhMuc2 = danhMuc2.name;

    // return { id: category.id, name: categoryName[language] }
  }

  async handleMetadataWhenCreateProduct(dto: CreateProductDto) {
    const product = plainToClass(ProductEntity, dto);
    let tenDanhMuc1: string;
    let tenDanhMuc2: string;

    let danhMuc1 = await this.categoryRepository.findOneBy({
      id: dto.categoryLevel1Id,
    });
    let danhMuc2 = await this.categoryRepository.findOneBy({
      id: dto.categoryLevel2Id,
    });
    tenDanhMuc1 = danhMuc1.name;
    tenDanhMuc2 = danhMuc2.name;
    const productExtens = product.content;
    productExtens.forEach((ext) => {
      const language = ext.language;
      const nameByLanguage1 = tenDanhMuc1[language];
      const nameByLanguage2 = tenDanhMuc2[language];
      ext.metadata = {
        danhMuc1: {
          id: danhMuc1.id,
          name: nameByLanguage1,
          link: danhMuc1.link,
        },
        danhMuc2: {
          id: danhMuc2.id,
          name: nameByLanguage2,
          link: danhMuc2.link,
        },
      };
    });
    return product;
  }

  async addProducts(dto: CreateProductDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction();
    try {
      const productRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity);
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
      const checkLinkProduct = await this.productRepository.findOneBy({
        link: dto.link,
      });
      if (checkLinkProduct) {
        throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại');
      }

      dto.categoryId = dto.categoryLevel2Id;
      const product = await this.handleMetadataWhenCreateProduct(dto);
      const productSaved = await productRepositoryTransaction.save(product);
      await this.managerTransaction.commit();
      const response = new BaseResponse(
        'Thêm sản phẩm thành công',
        productSaved,
      );
      return response;
    } catch (error) {
      await this.managerTransaction.rollBack();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateProducts(dto: UpdateProductDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction();
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity);
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
      const checkLinkProduct = await this.productRepository.findOneBy({
        link: dto.link,
      });
      if (checkLinkProduct && checkLinkProduct.id != dto.id) {
        throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại');
      }
      dto.categoryId = dto.categoryLevel2Id;
      const product = await this.handleMetadataWhenCreateProduct(dto);
      const productSaved = await categoryRepositoryTransaction.save(product);
      await this.managerTransaction.commit();
      const response = new BaseResponse(
        'Cập nhật sản phẩm thành công',
        productSaved,
      );
      return response;
    } catch (error) {
      await this.managerTransaction.rollBack();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateProductStatus(dto: UpdateStatusDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction();
    try {
      const productRepositoryTransaction =
        queryRunner.manager.getRepository(ProductEntity);
      const getProductDto = new GetProductDetailDto();
      getProductDto.productId = dto.id;
      let isProductExisting =
        await this.customProductRepository.adminGetProductDetail(getProductDto);
      if (!isProductExisting) {
        throw new Error('Sản phẩm không tồn tại');
      }
      let product = plainToClass(ProductEntity, dto);
      const productSaved = await productRepositoryTransaction.save(product);
      await this.managerTransaction.commit();
      const response = new BaseResponse(
        'Cập nhật trạng thái sản phẩm thành công',
        productSaved,
      );
      return response;
    } catch (error) {
      await this.managerTransaction.rollBack();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCategoriesActive() {
    const data = await this.categoryService.getAllCategories(
      language.VIETNAMESE,
    );
    let i = 0;
    const findRootCategories = data.data;
    while (i < findRootCategories.length) {
      const cate = findRootCategories[i];
      if (cate.subCategories.length > 0) {
        findRootCategories.push.apply(findRootCategories, cate.subCategories);
      }
      i++;
    }
    return findRootCategories.map((e) => e.id);
  }

  async removeProduct(id: number): Promise<BaseResponse> {
    try {
      const products = await this.productRepository.delete(id);
      const response = new BaseResponse('Xóa thành công', products);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  spreadOutCategory(arr: CategoryEntity[]) {
    let i = 0;
    while (i < arr.length) {
      const cate = arr[i];
      if (cate.subCategories.length > 0) {
        arr.push.apply(arr, cate.subCategories);
      }
      i++;
    }
    return arr.map((e) => e.id);
  }

  async adminGetAllProducts(dto: SearchDto): Promise<any> {
  try {
      // lấy tất cả các category đang hoạt động
      const findRootCategories =
        await this.categoryService.getAllCategoriesByAdmin();
      const categoryId = this.spreadOutCategory(findRootCategories.data);
      let searchName = 'AND ext.name LIKE :name';
      let isHighlight = '';
      if (dto.isHighlight != null) {
        isHighlight = ` AND product.isHighlight = ${dto.isHighlight}`;
      }
      if (dto.name == null || dto.name.trim() == '') {
        searchName = '';
      }
      const pagination = new Pagination(dto.page, dto.size);
      const result = await this.productRepository
        .createQueryBuilder('product')
        .innerJoin(
          'product.content',
          'ext',
          `LOWER(ext.language) = LOWER(:language) ${searchName}`,
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'product.id',
          'product.link',
          'product.isActive',
          'ext.name',
          'ext.language',
          'ext.description',
          'ext.metadata',
        ])
        .where('product.softDeleted = false')
        .andWhere(`product.categoryId IN (:categoryId) ${isHighlight}`, {
          categoryId: categoryId,
        })
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount();

      // this.handleLanguageGetCategory(dto.language, result[0])

      const products = result[0].map((product) => {
        const ext = product.content[0];
        let danhMuc1;
        let danhMuc2;

        if (ext.metadata) {
          danhMuc1 = ext.metadata['danhMuc1'];
          danhMuc2 = ext.metadata['danhMuc2'];
        }

        delete product.content;
        return {
          ...product,
          title: ext.name,
          name: ext.name,
          danhMuc1,
          danhMuc2,
          description: ext.description,
        };
      });
      pagination.createResult(result[1]);
      const response = new BaseResponse('Kết quả tìm kiếm', {
        products,
        pagination,
      });
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /*
  - name != null: Tìm kiếm theo tên sp
  */
  // KHÔNG SỬ DỤNG
  async getAllProduct(dto: SearchDto): Promise<any> {
    try {
      const language = dto.language.toUpperCase();
      let categoryId = dto.categoryId;
      let isHighlight = '';
      if (dto.isHighlight != null) {
        isHighlight = ` AND product.isHighlight = ${dto.isHighlight}`;
      }
      if (!categoryId) {
        //search tất cả
        categoryId = await this.getAllCategoriesActive();
      }
      let searchName = 'AND ext.name LIKE :name';
      if (dto.name == null || dto.name.trim() == '') {
        searchName = '';
      }
      
      const productQueryBuilder = this.productRepository
        .createQueryBuilder('product')
        .innerJoin(
          'product.content',
          'ext',
          `ext.language = :language ${searchName}`,
          { language: language, name: `%${dto.name}%` },
        )
        .select([
          'product.id',
          'product.link',
          'product.imageUrl',
          'product.isHighlight',
          'ext.name',
          'ext.language',
          'ext.description',
          'ext.metadata',
        ])
        .where('product.softDeleted = false AND product.isActive = true')
        .andWhere(`product.categoryId IN (:categoryId) ${isHighlight}`, {
          categoryId: categoryId,
        })
      const pagination = new Pagination(dto.page, dto.size);
      const result = await productQueryBuilder
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount();

      const products = result[0].map((product) => {
        const ext = product.content[0];
        let danhMuc1;
        let danhMuc2;

        if (ext.metadata) {
          danhMuc1 = ext.metadata['danhMuc1'];
          danhMuc2 = ext.metadata['danhMuc2'];
        }
        delete product.content;
        return {
          ...product,
          name: ext.name,
          title: ext.name,
          danhMuc1,
          danhMuc2,
          description: ext.description,
        };
      });
      pagination.createResult(result[1]);
      const response = new BaseResponse('Kết quả tìm kiếm', {
        products,
        pagination,
      });
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async adminSearchProduct (dto: SearchDto): Promise<any> {
  //   try {
  //     // lấy tất cả các category đang hoạt động
  //     const findRootCategories =
  //       await this.categoryService.getAllCategoriesByAdmin()
  //     const categoryId = this.spreadOutCategory(findRootCategories.data)

  //     const pagination = new Pagination(dto.page, dto.size)
  //     const result = await this.productRepository
  //       .createQueryBuilder('product')
  //       .innerJoin(
  //         'product.content',
  //         'ext',
  //         'ext.language = :language AND ext.name LIKE :name',
  //         { language: dto.language, name: `%${dto.name}%` },
  //       )
  //       .select([
  //         'product.id',
  //         'product.link',
  //         'product.isActive',
  //         'ext.name',
  //         'ext.language',
  //         'ext.description',
  //       ])
  //       .where('product.softDeleted = false')
  //       .andWhere('product.categoryId IN (:categoryId)', {
  //         categoryId: categoryId,
  //       })
  //       .skip(pagination.skip)
  //       .take(pagination.size)
  //       .getManyAndCount()
  //     const products = result[0].map(product => {
  //       const ext = product.content[0]
  //       delete product.content
  //       return {
  //         ...product,
  //         name: ext.name,
  //         description: ext.description,
  //       }
  //     })
  //     pagination.createResult(result[1])
  //     const response = new BaseResponse('Kết quả tìm kiếm', {
  //       products,
  //       pagination,
  //     })
  //     return response
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }
}
