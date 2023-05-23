import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm'
import { MenuEntity } from './entity/menu.entity'
import { DataSource, Repository } from 'typeorm'
import { BaseResponse } from 'src/common/response/base.response'
import { CreateMenuDto } from './dto/create-menu.dto'
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager'
import { plainToClass } from 'class-transformer'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { CommonService } from 'src/common/service/service.common'
import { language } from 'src/common/constant'

@Injectable()
export class MenuService extends CommonService {
  constructor (
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    private readonly managerTransaction: DatabaseTransactionManagerService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super()
  }

  async getMenuById (id: number): Promise<BaseResponse> {
    try {
      const menu = await this.menuRepository.findOneBy({ id: id })
      return new BaseResponse('Chi tiết Menu', menu, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getAllMenu (dto: string): Promise<BaseResponse> {
    try {
      const menu = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findTrees()
      this.filterMenuInActive(menu, dto)
      return new BaseResponse('Menu', menu, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetAllMenu (): Promise<BaseResponse> {
    try {
      const menu = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findTrees()
      this.adminFilterMenuInActive(menu)
      return new BaseResponse('Menu', menu, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateMenu (dto: UpdateMenuDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const menuRepositoryTransaction =
        queryRunner.manager.getRepository(MenuEntity)
      const treeRepository =
        this.dataSource.manager.getTreeRepository(MenuEntity)

      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      await this.validateUpdateMenu(dto)
      const menu = plainToClass(MenuEntity, dto)
      if (dto.parentId) {
        const children = await treeRepository
          .createDescendantsQueryBuilder('menu', 'children', menu)
          .getMany()
        if (children.some(c => c.id == dto.parentId)) {
          throw new Error(`Menu cha là cấp dưới`)
        }
        const parent = await menuRepositoryTransaction.findOneBy({
          id: dto.parentId,
        })
        if (parent) {
          menu.parent = parent
        }
      }
      const result = await menuRepositoryTransaction.save(menu)
      await this.managerTransaction.commit()
      const response = new BaseResponse('Cập nhật Menu thành công', result)
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateMenuStatus (dto: UpdateStatusDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const menuRepositoryTransaction =
        queryRunner.manager.getRepository(MenuEntity)
      let menu = [plainToClass(MenuEntity, dto)]
      if (dto.softDeleted) {
        const treeRepository =
          this.dataSource.manager.getTreeRepository(MenuEntity)
        let children = await treeRepository
          .createDescendantsQueryBuilder(
            'menu',
            'children',
            plainToClass(MenuEntity, dto),
          )
          .getMany()
        for (const e of children) {
          if (e.id == dto.id) {
            continue
          }
          e.softDeleted = true
          menu.push(e)
        }
      }
      const result = await menuRepositoryTransaction.save(menu)
      await this.managerTransaction.commit()
      const response = new BaseResponse('Cập nhật Menu thành công', result)
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createMenu (dto: CreateMenuDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction()
    try {
      const menuRepositoryTransaction =
        queryRunner.manager.getRepository(MenuEntity)
      dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      await this.validateCreateMenu(dto)
      const menu = plainToClass(MenuEntity, dto)
      if (dto.parentId) {
        const parent = await menuRepositoryTransaction.findOneBy({
          id: dto.parentId,
        })
        if (parent) {
          menu.parent = parent
        }
      }
      const result = await menuRepositoryTransaction.save(menu)
      await this.managerTransaction.commit()
      const response = new BaseResponse('Tạo Menu thành công', result)
      return response
    } catch (error) {
      await this.managerTransaction.rollBack()
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async validateUpdateMenu (dto: UpdateMenuDto) {
    for (let k in dto.name) {
      const v = dto.name[k]
      const checkName = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.name LIKE :name', { name: `%${v}%` })
        .getMany()

      if (checkName.length > 0) {
        checkName.forEach(menu => {
          if (menu.name[k] == v && menu.id != dto.id) {
            throw new Error(`Tên Menu '${v}' đã tồn tại`)
          }
        })
      }
    }
    const checkLink = await this.menuRepository.findOneBy({ link: dto.link })
    if (checkLink && checkLink.id != dto.id) {
      throw new BadRequestException('Đường dẫn Menu sản phẩm đã tồn tại')
    }
  }

  async validateCreateMenu (dto: CreateMenuDto) {
    for (let k in dto.name) {
      const v = dto.name[k]
      const checkName = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.name LIKE :name', { name: `%${v}%` })
        .getMany()

      if (checkName.length > 0) {
        checkName.forEach(menu => {
          if (menu.name[k] == v) {
            throw new Error(`Tên Menu '${v}' đã tồn tại`)
          }
        })
      }
    }
    const checkLink = await this.menuRepository.findOneBy({ link: dto.link })
    if (checkLink) {
      throw new BadRequestException('Đường dẫn Menu đã tồn tại')
    }
  }
  filterMenuInActive (arr: MenuEntity[], language: string) {
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i]
      if (e.name) {
        const name = e.name[language]
        arr[i].name = name ? name : ''
      } else e.name = ''
      if (e.isActive == false || e.softDeleted == true) {
        arr.splice(i, 1)
        i--
      }
      delete e.softDeleted
      delete e.priority
      delete e.description
      delete e.createdAt
      delete e.updatedAt
      if (e.children.length > 0) {
        this.filterMenuInActive(e.children, language)
      } else continue
    }
  }

  adminFilterMenuInActive (arr: MenuEntity[]) {
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i]
      if (e.name) {
        const name = e.name[language.VIETNAMESE]
        arr[i].name = name ? name : ''
      } else e.name = ''
      if (e.softDeleted == true) {
        arr.splice(i, 1)
        i--
      }
      if (e.children.length > 0) {
        this.adminFilterMenuInActive(e.children)
      } else continue
    }
  }
}
