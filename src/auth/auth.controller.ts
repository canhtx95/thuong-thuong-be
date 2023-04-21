import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: 'login' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }
}
