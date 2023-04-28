import { Body, Controller, Get, Post } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/response/base.response';
import { CreateMenuDto } from './dto/create-menu.dto';
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @ApiOperation({ summary: 'Lấy danh sách menu' })
  @Get('')
  getAllMenu(): Promise<BaseResponse> {
    return this.menuService.getAllMenu();
  }

  @ApiOperation({ summary: 'Tạo mới menu' })
  @Post('/create')
  createMenu(@Body() dto: CreateMenuDto): Promise<BaseResponse> {
    return this.menuService.createMenu(dto);
  }
}
