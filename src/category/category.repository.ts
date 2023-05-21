import { Repository, BaseEntity } from 'typeorm'
import { CategoryEntity } from './entity/category.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
@Injectable()
export class CustomCategoryRepository {
  constructor (
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll () {
    const data = this.categoryRepository.find({
      select: [
        'id',
        'name',
        'link',
        'isHighlight',
        'isActive',
        'parent',
        'description',
      ],
      where: { softDeleted: false },
    })
    return data
  }

  async findCategoryByIdOrLink (
    id: number,
    link: string,
  ): Promise<CategoryEntity> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'cate.isHighlight',
        'cate.isActive',
        'cate.parent',
      ])
      .where(`cate.soft_deleted = :sd`, {
        sd: false,
      })
      .andWhere(`cate.id =:id OR cate.link=:link`, {
        id: id,
        link: link,
      })
      .orderBy('cate.id')
      .getOne()
    return data
  }

  async findSubCategoryById (id: number): Promise<CategoryEntity[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'cate.isHighlight',
        'cate.isActive',
        'cate.parent',
      ])
      .where(
        `cate.softDeleted = false AND (cate.parent LIKE '%/:id/%' OR cate.parent LIKE '%/:id%')`,
        {
          id: id,
        },
      )
      .getMany()
    return data
  }

  async findRootCategories (): Promise<CategoryEntity[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select(['cate.id'])
      .where(
        `cate.softDeleted = false AND (cate.parent = '' OR cate.parent is null)`
      )
      .getMany()
    return data
  }
}
