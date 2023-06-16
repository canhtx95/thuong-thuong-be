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
import { ArticleContentEntity } from './entity/article-content.entity'
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
      let menuToFind = []
      let searchName = ''
      if (dto.name) {
        searchName = ` AND LOWER(content.name) LIKE LOWER(:name)`
      }
      if (dto.id == null && dto.link == null) {
        menuToFind = await this.menuService
          .getAllMenu(null)
          .then(res => this.spreadOutMenu(res.data))
      } else {
        const menuDto = await this.menuRepository
          .createQueryBuilder('menu')
          .leftJoinAndSelect('menu.parent', 'parent')
          .where('menu.softDeleted = false AND menu.isActive = true')
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
        menuToFind = await menuTreeRepository
          .findDescendants(menuDto)
          .then(menu => menu.map(m => m.id))
      }
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.content',
          'content',
          `LOWER(content.language) = LOWER(:language) ${searchName}`,
          { language: dto.language, name: `%${dto.name}%` },
        )
        .select([
          'art.id',
          'art.link',
          'art.imageUrl',
          'art.createdAt',
          'content',
        ])
        .where('(art.softDeleted = false AND art.isActive = true)')
        .andWhere('art.menuId IN (:id)', {
          id: menuToFind,
        })
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()

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
        // menu: menuDto,
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
      let menuToFind = []
      let searchName = ''
      if (dto.name) {
        searchName = ` AND LOWER(content.name) LIKE LOWER(:name)`
      }
      if (dto.id == null && dto.link == null) {
        menuToFind = await this.menuService
          .adminGetAllMenu()
          .then(res => this.spreadOutMenu(res.data))
      } else {
        const menuDto = await this.menuRepository
          .createQueryBuilder('menu')
          .leftJoinAndSelect('menu.parent', 'parent')
          .where('menu.softDeleted = false ')
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
        menuToFind = await menuTreeRepository
          .findDescendants(menuDto)
          .then(menu => menu.map(m => m.id))
      }
      let searchFromDate = ''
      let searchToDate = ''
      let searchStatus = ''

      if (dto.fromDate) {
        searchFromDate = ` AND art.created_at >=  STR_TO_DATE('${dto.fromDate}', '%d/%m/%Y')`
      }
      if (dto.toDate) {
        searchToDate = ` AND art.created_at <= STR_TO_DATE('${dto.toDate}', '%d/%m/%Y')`
      }
      if (dto.status != null) {
        searchStatus = `AND art.isActive = ${dto.status}`
      }
      const pagination = new Pagination(dto.page, dto.size)
      const result = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.content',
          'content',
          `LOWER(content.language) = LOWER(:language) ${searchName}`,
          { language: dto.language, name: `%${dto.name}%` },
        )
        .where('art.softDeleted = false')
        .andWhere(
          `art.menuId IN (:id) ${searchStatus} ${searchFromDate} ${searchToDate}`,
          {
            id: menuToFind,
          },
        )
        // .skip(pagination.skip)
        // .take(pagination.size)
        .getManyAndCount()

      const articles = result[0].map(art => {
        const content = art.content[0]
        delete art.content
        return {
          ...art,
          createdAt: this.formmatDate(art.createdAt, this.DDMMYY_ssMMHH),
          updatedAt: this.formmatDate(art.updatedAt, this.DDMMYY_ssMMHH),
          name: content.name,
          title: content.name,
          description: content.description,
        }
      })
      let total = result[1]
      pagination.createResult(total)

      const response = new BaseResponse('Lấy dữ liệu thành công', {
        // menu: menuDto,
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
      const link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`
      let article = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoin(
          'art.menu',
          'menu',
          'menu.softDeleted = false AND menu.isActive = true',
        )
        .innerJoinAndSelect(
          'art.content',
          'content',
          'LOWER(content.language) =LOWER(:language)',
          { language: dto.language },
        )
        .select(['art', 'content'])
        .where('art.softDeleted = false AND art.isActive = true')
        .andWhere('(art.id =:id OR art.link =:link)', {
          id: dto.id,
          link: link,
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
        breadCrumb: extensions.breadCrumb,
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
      delete article.menu
      const extensions = article.content[0]
      return new BaseResponse('Lấy dữ liệu thành công', {
        ...article,
        breadCrumb: extensions.breadCrumb,
      })
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async handleBreadCrumbMenu (
    menuId: string | number,
    articleExtension: ArticleContentEntity[],
  ) {
    const menu = await this.menuRepository
      .createQueryBuilder('menu')
      .where('id = :id', { id: menuId })
      .andWhere('menu.softDeleted = false')
      .getOne()
    if (!menu) {
      throw new Error('Menu không tồn tại')
    } else if (menu.isActive == false) {
      throw new Error('Menu đang bị ẩn')
    }
    const menuAncestor = await this.dataSource.manager
      .getTreeRepository(MenuEntity)
      .createAncestorsQueryBuilder('menu', 'menu-closure', menu)
      .getMany()
    if (menuAncestor.length == 0) {
      throw new Error('Menu cấp cha không tồn tại')
    } else {
      menuAncestor.forEach(m => {
        if (m.softDeleted == true) {
          throw new Error('Menu cấp cha không tồn tại')
        }
        if (m.isActive == false)
          throw new Error('Menu cấp cha đang không hoạt động')
      })
    }
    articleExtension.forEach(ext => {
      const language = ext.language
      const breadCrumb = menuAncestor.map(menu => {
        return { id: menu.id, link: menu.link, menu: menu.name[language] }
      })
      ext.breadCrumb = breadCrumb
    })
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
        await this.handleBreadCrumbMenu(dto.menuId, dto.content)
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Tạo bài viết thành công ', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async getAllContentOfArticle (id: number) {
    const content = this.articleRepository.findOneBy
  }

  async updateArticle (dto: UpdateArticleDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const repositoryExt = transaction.getRepository(ArticleContentEntity)

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

        // let oldContent = (
        //   await repository.findOne({
        //     where: { id: dto.id },
        //     relations: ['content'],
        //   })
        // ).content
        // const newContent = oldContent.reduce((acc, cur) => {
        //   const language = cur.language
        //   const findContentInDto = dto.content.find(e => e.language == language)
        //   if (findContentInDto) acc.push(findContentInDto)
        //   else acc.push(cur)
        //   return acc
        // }, [])
        // dto.content = newContent

        await this.handleBreadCrumbMenu(dto.menuId, dto.content)

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
        // const article = plainToClass(ArticleEntity, dto)
        const articles = dto.ids.map(id => {
          return { ...plainToClass(ArticleEntity, dto), id: id }
        })
        result = await repository.save(articles)
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

  // KHÔNG SỬ DỤNG
  async searchArticles (dto: SearchDto): Promise<any> {
    try {
      const language = dto.language.toUpperCase()
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
          { language: language, name: `%${dto.name}%` },
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
