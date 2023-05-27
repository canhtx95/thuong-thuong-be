import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { ArticleEntity } from './entity/article.entity'
import { DataSource, Repository } from 'typeorm'
import { BaseResponse } from 'src/common/response/base.response'
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { getArticleDto } from './dto/get-article.dto'
import { plainToClass } from 'class-transformer'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { CommonService } from 'src/common/service/service.common'
import { MenuEntity } from 'src/menu/entity/menu.entity'
import { Pagination } from 'src/common/service/pagination.service'
import { SearchDto } from 'src/common/dto/search.dto'
import { MenuService } from 'src/menu/menu.service'
@Injectable()
export class ArticleService extends CommonService {
  constructor (
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly menuService: MenuService,
  ) {
    super()
  }
  async getArticleByMenuIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      const menuTreeRepository =
        await this.dataSource.manager.getTreeRepository(MenuEntity)

      const menuDto = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.softDeleted = false AND menu.isActive = true')
        .select(['menu.id', 'menu.name', 'menu.link'])
        .andWhere('(menu.id =:id OR menu.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!menuDto) {
        throw new Error('Menu không tồn tại')
      }
      const menuAncestor = await menuTreeRepository.findAncestors(menuDto)
      if (
        menuAncestor.some(e => e.isActive == false || e.softDeleted == true)
      ) {
        throw new Error('Menu không tồn tại')
      }
      const menuDescendantsId = await menuTreeRepository
        .findDescendants(menuDto)
        .then(menu => menu.map(m => m.id))
      // const menuDescendantsId = menuDescendants.map(e => e.id)
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.content',
          'content',
          'content.language = :language',
          { language: dto.language },
        )
        .select(['art.id', 'art.link', 'content'])
        .where('(art.softDeleted = false AND art.isActive = true)')
        .andWhere('art.menuId IN (:id)', {
          id: menuDescendantsId,
        })
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()

      menuDto.name = this.getNameMultiLanguage(dto.language, menuDto.name)
      const articles = result[0].map(art => {
        const content = art.content[0]
        delete art.content
        return {
          ...art,
          name: content.name,
          title: content.name,
          description: content.description,
        }
      })
      let total = result[1]
      pagination.createResult(total)

      const response = new BaseResponse('Lấy dữ liệu thành công', {
        menu: menuDto,
        articles,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetArticleByMenuIdOrLink (
    dto: getArticleDto,
  ): Promise<BaseResponse> {
    try {
      const menuTreeRepository =
        await this.dataSource.manager.getTreeRepository(MenuEntity)

      const menuDto = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.softDeleted = false')
        .andWhere('(menu.id =:id OR menu.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!menuDto) {
        throw new Error('Menu không tồn tại')
      }
      const menuAncestor = await menuTreeRepository.findAncestors(menuDto)
      if (menuAncestor.some(e => e.softDeleted == true)) {
        throw new Error('Menu không tồn tại')
      }
      const menuDescendantsId = await menuTreeRepository
        .findDescendants(menuDto)
        .then(menu => menu.map(m => m.id))
      // const menuDescendantsId = menuDescendants.map(e => e.id)
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.content',
          'content',
          'content.language = :language',
          { language: dto.language },
        )
        .where('art.softDeleted = false')
        .andWhere('art.menuId IN (:id)', {
          id: menuDescendantsId,
        })
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()

      menuDto.name = this.getNameMultiLanguage(dto.language, menuDto.name)
      const articles = result[0].map(art => {
        const content = art.content[0]
        delete art.content
        return {
          ...art,
          name: content.name,
          description: content.description,
        }
      })
      let total = result[1]
      pagination.createResult(total)

      const response = new BaseResponse('Lấy dữ liệu thành công', {
        menu: menuDto,
        articles,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getArticleByIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      let article = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.menu',
          'menu',
          'menu.softDeleted = false AND menu.isActive = true',
        )
        .innerJoinAndSelect(
          'art.content',
          'content',
          'content.language =:language',
          { language: dto.language },
        )
        .select(['art', 'menu.id', 'menu.link', 'menu.name', 'content'])
        .where('art.softDeleted = false AND art.isActive = true')
        .andWhere('(art.id =:id OR art.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!article) {
        throw new Error('Bài viết không tồn tại')
      }
      const menuAncestor = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findAncestors(article.menu)
      if (
        menuAncestor.some(e => e.softDeleted == true || e.isActive == false)
      ) {
        throw new Error('Bài viết không tồn tại')
      }

      const extensions = article.content[0]
      delete article.isActive
      delete article.softDeleted
      return new BaseResponse('Lấy dữ liệu thành công', {
        ...article,
        name: extensions.name,
        description: extensions.description,
        content: extensions.content,
      })
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetArticleByIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      let article = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect('art.menu', 'menu', 'menu.softDeleted = false')
        .innerJoinAndSelect('art.content', 'content')
        .select(['art', 'menu.id', 'menu.link', 'menu.name', 'content'])
        .where('art.softDeleted = false')
        .andWhere('(art.id =:id OR art.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!article) {
        throw new Error('Bài viết không tồn tại')
      }
      const menuAncestor = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findAncestors(article.menu)
      if (menuAncestor.some(e => e.softDeleted == true)) {
        throw new Error('Bài viết không tồn tại')
      }
      return new BaseResponse('Lấy dữ liệu thành công', article)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createArticle (dto: CreateArticleDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const checkLink = await repository.findOneBy({ link: dto.link })
        if (checkLink) {
          throw new Error('Đường dẫn đã tồn tại')
        }
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Tạo bài viết thành công ', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateArticle (dto: UpdateArticleDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const checkLink = await repository.findOneBy({ link: dto.link })
        if (checkLink && checkLink.id != dto.id) {
          throw new Error('Đường dẫn đã tồn tại')
        }
        const menu = await transaction
          .getRepository(MenuEntity)
          .findOneBy({ id: dto.menuId })
        let menuAncestor = await transaction
          .getTreeRepository(MenuEntity)
          .findAncestors(menu)
        for (const m of menuAncestor) {
          if (m.softDeleted == true) throw new Error('Menu không tồn tại')
        }
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Cập nhật bài viết thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateArticleStatus (dto: UpdateStatusDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Cập nhật bài viết thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  spreadOutMenu (arr: MenuEntity[]) {
    let i = 0
    while (i < arr.length) {
      const menu = arr[i]
      if (menu.children.length > 0) {
        arr.push.apply(arr, menu.children)
      }
      i++
    }
    return arr.map(e => e.id)
  }

  async searchArticles (dto: SearchDto): Promise<any> {
    try {
      // lấy tất cả các Menu đang hoạt động
      const menuId = await this.menuService
        .getAllMenu(null)
        .then(res => this.spreadOutMenu(res.data))
      const queryRunner = this.articleRepository
        .createQueryBuilder('art')
        .innerJoin(
          'art.content',
          'ext',
          'ext.language = :language ' +
            (dto.name ? ' AND ext.name LIKE :name' : ''),
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'art.id',
          'art.link',
          'art.createdAt',
          'art.imageUrl',
          'ext.name',
          'ext.language',
          'ext.description',
        ])
        .where('art.softDeleted = false AND art.isActive = true')
        .andWhere('art.menuId IN (:menuId)', {
          menuId: menuId,
        })
      const pagination = new Pagination(dto.page, dto.size)
      const result = await queryRunner
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()
      const articles = result[0].map(article => {
        const ext = article.content[0]
        delete article.content
        return {
          ...article,
          name: ext.name,
          description: ext.description,
        }
      })
      pagination.createResult(result[1])
      const response = new BaseResponse('Kết quả tìm kiếm', {
        articles,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async adminSearchArticles (dto: SearchDto): Promise<any> {
    try {
      // lấy tất cả các Menu đang hoạt động
      const menuId = await this.menuService
        .adminGetAllMenu()
        .then(res => this.spreadOutMenu(res.data))

      const queryRunner = this.articleRepository
        .createQueryBuilder('art')
        .innerJoin(
          'art.content',
          'ext',
          'ext.language = :language AND ext.name LIKE :name',
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'art.id',
          'art.link',
          'ext.name',
          'ext.language',
          'ext.description',
        ])
        .where('art.softDeleted = false')
        .andWhere('art.menuId IN (:menuId)', {
          menuId: menuId,
        })
      const pagination = new Pagination(dto.page, dto.size)
      const result = await queryRunner
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()
      const articles = result[0].map(article => {
        const ext = article.content[0]
        delete article.content
        return {
          ...article,
          name: ext.name,
          description: ext.description,
        }
      })
      pagination.createResult(result[1])
      const response = new BaseResponse('Kết quả tìm kiếm', {
        articles,
        pagination,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
