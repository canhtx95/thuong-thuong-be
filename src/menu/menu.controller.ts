import { Body, Controller, Get, Post, Param } from '@nestjs/common'
import { MenuService } from './menu.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseResponse } from 'src/common/response/base.response'
import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor (private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Lấy danh sách menu' })
  @Get('')
  getAllMenu (): Promise<BaseResponse> {
    return this.menuService.getAllMenu()
  }

  @ApiOperation({ summary: 'Lấy chi tiết menu bằng Id' })
  @Get('/:id')
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
