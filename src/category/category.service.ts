import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager'
import { BaseResponse } from 'src/common/response/base.response'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CategoryEntity } from './entity/category.entity'
import { EntityManager, Repository } from 'typeorm'
import { plainToClass } from 'class-transformer'
import { getCategoryDto } from './dto/get-category.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomCategoryRepository } from './category.repository'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto'
import { CommonService } from 'src/common/service/service.common'
import { ROLE } from 'src/common/constant'
@Injectable()
export class CategoryService extends CommonService {
  constructor (
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly customCategoryRepository: CustomCategoryRepository,
    private readonly managerTransaction: DatabaseTransactionManagerService,
  ) {
    super()
  }

  async getAllCategories (dto: getCategoryDto): Promise<BaseResponse> {
    try {
      let data = await this.customCategoryRepository.findAll()
      data = data.filter(element => {
        const name = this.getNameMultiLanguage(
          dto.language,
          element.otherLanguage,
        )
        element.name = name ? name : element.name
        delete element.otherLanguage
        return element.isActive == true
      })
      data.sort((a, b) => {
        if (!a.parent) {
          a.parent = ''
        }
        if (!b.parent) {
          b.parent = ''
        }
        const level1 = a.parent.split('/').length
        const level2 = b.parent.split('/').length
        return level1 - level2
      })
      this.arrangeCategory(data)
      return new BaseResponse('Danh sách danh mục sản phẩm', data, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getAllCategoriesByAdmin (): Promise<BaseResponse> {
    try {
      let data = await this.customCategoryRepository.findAll()
      this.arrangeCategory(data, ROLE.ADMIN)
      return new BaseResponse('Danh sách danh mục sản phẩm', data, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getOneCategory (dto: getCategoryDto): Promise<BaseResponse> {
    try {
      let data = await this.customCategoryRepository.findCategoryByIdOrLink(
        dto.id,
        dto.link,
      )
      return new BaseResponse('Danh mục sản phẩm', data, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateCategory (dto: UpdateCategoryDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(CategoryEntity)
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      dto.parent = dto.parent.split('/').pop()
      const subCategories: CategoryEntity[] = []
      await this.handleUpdateCategoryDto(
        dto,
        categoryRepositoryTransaction,
        subCategories,
      )
      const category = plainToClass(CategoryEntity, dto)
      const categorySaved = await categoryRepositoryTransaction.save(category)
      // throw new Error("aaaasd")
      await categoryRepositoryTransaction.save(subCategories)

      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Cập nhật danh mục sản phẩm thành công',
        categorySaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateCategoryStatus (
    dto: UpdateCategoryStatusDto,
  ): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(CategoryEntity)
      // if (dto.isActive == true) {
      //   await this.checkStatusParentCategory(dto.id)
      // }
      const category = plainToClass(CategoryEntity, dto)
      const categorySaved = await categoryRepositoryTransaction.save(category)

      //cập nhật các categories con
      if (dto.softDeleted != null) {
        const subCategories =
          await this.customCategoryRepository.findSubCategoryById(dto.id)
        for (let sub of subCategories) {
          sub.softDeleted = dto.softDeleted
        }
        await categoryRepositoryTransaction.save(subCategories)
      }
      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Cập nhật danh mục sản phẩm thành công',
        categorySaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createCategory (dto: CreateCategoryDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const categoryRepositoryTransaction =
        queryRunner.manager.getRepository(CategoryEntity)
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      await this.validateCreateCategoryDto(dto, categoryRepositoryTransaction)
      let category = new CategoryEntity()
      category = plainToClass(CategoryEntity, dto)
      // const categorySaved = await categoryRepositoryTransaction.save(category);
      const categorySaved = await categoryRepositoryTransaction.save(category)

      await this.managerTransaction.commit()
      const response = new BaseResponse(
        'Tạo danh mục sản phẩm thành công',
        categorySaved,
      )
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async validateCreateCategoryDto (
    dto: CreateCategoryDto,
    repository: Repository<CategoryEntity>,
  ): Promise<any> {
    const checkCategoryName = await repository.findOneBy({ name: dto.name })
    if (checkCategoryName) {
      throw new BadRequestException('Tên danh mục sản phẩm đã tồn tại')
    }
    const checkCategoryLink = await repository.findOneBy({ link: dto.link })
    if (checkCategoryLink) {
      throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại')
    }
  }

  async handleUpdateCategoryDto (
    dto: UpdateCategoryDto,
    repository: Repository<CategoryEntity>,
    subCategories: CategoryEntity[],
  ): Promise<any> {
    const checkCategoryName = await repository.findOneBy({ name: dto.name })
    if (checkCategoryName && checkCategoryName.id != dto.id) {
      throw new BadRequestException('Tên danh mục sản phẩm đã tồn tại')
    }
    const checkCategoryLink = await repository.findOneBy({ link: dto.link })
    if (checkCategoryLink && checkCategoryLink.id != dto.id) {
      throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại')
    }
    const getSubCategories =
      await this.customCategoryRepository.findSubCategoryById(dto.id)
    subCategories.push.apply(subCategories, getSubCategories)
    if (dto.parent != ''.trim()) {
      const parentCategory = await repository.findOneBy({
        id: parseInt(dto.parent),
      })
      if (!parentCategory) {
        throw new BadRequestException('Danh mục cha không tồn tại')
      }
      // kiểm tra trường hợp category nhận chính cấp dưới của nó làm cha
      const subId = subCategories.map(e => e.id)
      if (subId.some(id => id == parseInt(dto.parent))) {
        throw new Error('Danh mục cha không hợp lệ: Danh mục này là cấp dưới')
      }
      // parent tree
      const parentTreeOfCategory = `${parentCategory.parent}/${dto.parent}`
      dto.parent = parentTreeOfCategory
    }
    // cập nhật lại parent tree cho các con
    subCategories.forEach(sub => {
      const parent = sub.parent.split('/')
      const index = parent.findIndex(n => n == dto.id.toString())
      sub.parent = dto.parent + '/' + parent.slice(index).join('/')
    })
  }

  async arrangeCategory (categories: CategoryEntity[], role?) {
    const element = categories[categories.length - 1]

    if (element.parent.trim() == '') {
      if (role != ROLE.ADMIN) {
        delete element.parent
        delete element.isActive
        delete element.isHighlight
      }
      return
    }
    let parentId = parseInt(element.parent.split('/').pop())
    for (let cate of categories) {
      if (parentId == cate.id) {
        if (role != ROLE.ADMIN) {
          delete element.parent
          delete element.isActive
          delete element.isHighlight
        }
        cate.subCategories.push(element)
        break
      }
    }
    categories.pop()
    this.arrangeCategory(categories, role)
  }
}
