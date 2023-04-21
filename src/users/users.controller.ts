import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseResponse } from 'src/common/response/base.response';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersSerivce: UsersService) {}

  @ApiOperation({ summary: 'Tạo mới user' })
  @Post('register')
  create(@Body() user: CreateUserDto): Promise<BaseResponse> {
    return this.usersSerivce.create(user);
  }
}
