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
            return new BaseResponse('Chi tiết danh mục', menu, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    async getAllMenu(): Promise<BaseResponse> {
        try {
            const subMenus = await this.menuRepository.createQueryBuilder('menu')
                .leftJoinAndSelect('menu.subMenu', 'sub_lev1', 'sub_lev1.softDeleted = false')
                .leftJoinAndSelect('sub_lev1.subMenu', 'sub_lev2', 'sub_lev2.softDeleted = false')
                .leftJoinAndSelect('sub_lev2.subMenu', 'sub_lev3', 'sub_lev3.softDeleted = false')
                .leftJoinAndSelect('sub_lev3.subMenu', 'sub_lev4', 'sub_lev4.softDeleted = false')
                .where('menu.softDeleted = false')

                .getMany();
            const result = subMenus.filter(e => !e.parentId)
            return new BaseResponse('Danh mục', result, 200);
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
                'Cập nhật danh mục thành công',
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
                'Cập nhật danh mục thành công',
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
                'Tạo danh mục thành công',
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
            throw new BadRequestException('Tên danh mục sản phẩm đã tồn tại');
        }
        const checkLink = await this.menuRepository.findOneBy({ link: dto.link });
        if (checkLink && checkLink.id != dto.id) {
            throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại');
        }
        if (dto.parentId) {
            const checkParent = await this.menuRepository.findOneBy({ parentId: dto.parentId });
            if (!checkParent) {
                throw new BadRequestException('Danh mục cha không tồn tại');
            }
        }

    }

    async validateCreateMenu(dto: CreateMenuDto) {
        const checkName = await this.menuRepository.findOneBy({ name: dto.name });
        if (checkName) {
            throw new BadRequestException('Tên danh mục đã tồn tại');
        }
        const checkLink = await this.menuRepository.findOneBy({ link: dto.link });
        if (checkLink) {
            throw new BadRequestException('Đường dẫn danh mục đã tồn tại');
        }
        if (dto.parentId) {
            const checkParent = await this.menuRepository.findOneBy({ parentId: dto.parentId });
            if (!checkParent) {
                throw new BadRequestException('Danh mục cha không tồn tại');
            }
        }

    }
}
