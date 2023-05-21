import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common'
import { MenuService } from './menu.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseResponse } from 'src/common/response/base.response'
import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard'

@ApiTags('menu')
@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor (private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Lấy danh sách menu' })
  @Get('')
  @PublicEndpoint()
  async getAllMenu (@Query('language') language: string): Promise<BaseResponse> {
    return this.menuService.getAllMenu(language)
  }

  @ApiOperation({ summary: 'Lấy danh sách menu' })
  @Get('admin-get-all')
  async getAllMenuByAdmin (): Promise<BaseResponse> {
    return this.menuService.adminGetAllMenu()
  }

  @ApiOperation({ summary: 'Lấy chi tiết menu bằng Id' })
  @Get('/detail/:id')
  getMenuById (@Param('id') id: number): Promise<BaseResponse> {
    return this.menuService.getMenuById(id)
  }

  @ApiOperation({ summary: 'Tạo mới menu' })
  @Post('/create')
  createMenu (@Body() dto: CreateMenuDto): Promise<BaseResponse> {
    return this.menuService.createMenu(dto)
  }

  @ApiOperation({ summary: 'Cập nhật menu' })
  @Post('/update')
  updateMenu (@Body() dto: UpdateMenuDto): Promise<BaseResponse> {
    return this.menuService.updateMenu(dto)
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái menu: Xóa, ẩn' })
  @Post('/update-status')
  updateMenuStatus (@Body() dto: UpdateStatusDto): Promise<BaseResponse> {
    return this.menuService.updateMenuStatus(dto)
  }
}
