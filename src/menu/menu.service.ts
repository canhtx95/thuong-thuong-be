import {
    HttpException,
    HttpStatus,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { MenuEntity } from './entity/menu.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseResponse } from 'src/common/response/base.response';
import { CreateMenuDto } from './dto/create-menu.dto';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { plainToClass } from 'class-transformer';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdateStatusDto } from 'src/common/dto/update-status.dto';

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
        private readonly managerTransaction: DatabaseTransactionManagerService,
        @InjectDataSource()
        private readonly dataSource: DataSource,

    ) { }

    async getMenuById(id: number): Promise<BaseResponse> {
        try {
            const menu = await this.menuRepository.findOneBy({ id: id });
            return new BaseResponse('Chi tiết Menu', menu, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    async getAllMenu(): Promise<BaseResponse> {
        try {
            const menu = await this.menuRepository.createQueryBuilder('menu')
                .leftJoinAndSelect('menu.subMenu', 'sub_lev1', 'sub_lev1.softDeleted = false AND sub_lev1.isActive = true')
                .leftJoinAndSelect('sub_lev1.subMenu', 'sub_lev2', 'sub_lev2.softDeleted = false AND sub_lev2.isActive = true')
                .leftJoinAndSelect('sub_lev2.subMenu', 'sub_lev3', 'sub_lev3.softDeleted = false AND sub_lev3.isActive = true')
                .leftJoinAndSelect('sub_lev3.subMenu', 'sub_lev4', 'sub_lev4.softDeleted = false AND sub_lev4.isActive = true')
                .select(['menu.id','menu.name','menu.link','menu.createdAt','menu.updatedAt','menu.parentId'])
                .addSelect(['sub_lev1.id','sub_lev1.name','sub_lev1.link','sub_lev1.createdAt','sub_lev1.updatedAt','sub_lev1.parentId'])
                .addSelect(['sub_lev2.id','sub_lev2.name','sub_lev2.link','sub_lev2.createdAt','sub_lev2.updatedAt','sub_lev2.parentId'])
                .addSelect(['sub_lev3.id','sub_lev3.name','sub_lev3.link','sub_lev3.createdAt','sub_lev3.updatedAt','sub_lev3.parentId'])
                .addSelect(['sub_lev4.id','sub_lev4.name','sub_lev4.link','sub_lev4.createdAt','sub_lev4.updatedAt','sub_lev4.parentId'])
                .where('menu.softDeleted = false AND menu.isActive = true')
                .orderBy('menu.priority')
                .addOrderBy('menu.id')
                .getMany();
            const result = menu.filter(e => !e.parentId)
            return new BaseResponse('Menu', result, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    async adminGetAllMenu(): Promise<BaseResponse> {
        try {
            const subMenus = await this.menuRepository.createQueryBuilder('menu')
                .leftJoinAndSelect('menu.subMenu', 'sub_lev1', 'sub_lev1.softDeleted = false')
                .leftJoinAndSelect('sub_lev1.subMenu', 'sub_lev2', 'sub_lev2.softDeleted = false')
                .leftJoinAndSelect('sub_lev2.subMenu', 'sub_lev3', 'sub_lev3.softDeleted = false')
                .leftJoinAndSelect('sub_lev3.subMenu', 'sub_lev4', 'sub_lev4.softDeleted = false')
                .where('menu.softDeleted = false')
                .orderBy('menu.priority')
                .addOrderBy('menu.id')
                .getMany();
            const result = subMenus.filter(e => !e.parentId)
            return new BaseResponse('Menu', result, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }
    async updateMenu(dto: UpdateMenuDto): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction();
        try {
            const menuRepositoryTransaction =
                queryRunner.manager.getRepository(MenuEntity);
            dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
            await this.validateUpdateMenu(dto)
            const menu = plainToClass(MenuEntity, dto)
            const result = await menuRepositoryTransaction.save(menu)
            await this.managerTransaction.commit();
            const response = new BaseResponse(
                'Cập nhật Menu thành công',
                result,
            );
            return response;
        } catch (error) {
            await this.managerTransaction.rollBack();
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async updateMenuStatus(dto: UpdateStatusDto): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction();
        try {
            const menuRepositoryTransaction =
                queryRunner.manager.getRepository(MenuEntity);
            const menu = plainToClass(MenuEntity, dto)
            const result = await menuRepositoryTransaction.save(menu)
            await this.managerTransaction.commit();
            const response = new BaseResponse(
                'Cập nhật Menu thành công',
                result,
            );
            return response;
        } catch (error) {
            await this.managerTransaction.rollBack();
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async createMenu(dto: CreateMenuDto): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction();
        try {
            const menuRepositoryTransaction =
                queryRunner.manager.getRepository(MenuEntity);
            dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
            await this.validateCreateMenu(dto)
            const menu = plainToClass(MenuEntity, dto)
            const result = await menuRepositoryTransaction.save(menu)
            await this.managerTransaction.commit();
            const response = new BaseResponse(
                'Tạo Menu thành công',
                result,
            );
            return response;
        } catch (error) {
            await this.managerTransaction.rollBack();
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async validateUpdateMenu(dto: UpdateMenuDto) {
        const checkName = await this.menuRepository.findOneBy({ name: dto.name });
        if (checkName && checkName.id != dto.id) {
            throw new BadRequestException('Tên Menu sản phẩm đã tồn tại');
        }
        const checkLink = await this.menuRepository.findOneBy({ link: dto.link });
        if (checkLink && checkLink.id != dto.id) {
            throw new BadRequestException('Đường dẫn Menu sản phẩm đã tồn tại');
        }
        if (dto.parentId) {
            const checkParent = await this.menuRepository.findOneBy({ parentId: dto.parentId });
            // const checkParent = await this.menuRepository.createQueryBuilder('menu')
            // .innerJoinAndSelect('menu.')

            if (!checkParent) {
                throw new BadRequestException('Menu cha không tồn tại');
            }
        }

    }

    async validateCreateMenu(dto: CreateMenuDto) {
        const checkName = await this.menuRepository.findOneBy({ name: dto.name });
        if (checkName) {
            throw new BadRequestException('Tên Menu đã tồn tại');
        }
        const checkLink = await this.menuRepository.findOneBy({ link: dto.link });
        if (checkLink) {
            throw new BadRequestException('Đường dẫn Menu đã tồn tại');
        }
        if (dto.parentId) {
            const checkParent = await this.menuRepository.findOneBy({ parentId: dto.parentId });
            if (!checkParent) {
                throw new BadRequestException('Menu cha không tồn tại');
            }
        }

    }
}
