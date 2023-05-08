import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entity/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { BaseResponse } from 'src/common/response/base.response';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private managerTransaction: DatabaseTransactionManagerService,
  ) { }

  async create(dto: CreateUserDto): Promise<BaseResponse> {
    const queryRunner = await this.managerTransaction.createTransaction();
    try {
      const userRepositoryTransaction =
        queryRunner.manager.getRepository(UserEntity);
      const checkUser = await userRepositoryTransaction.findOneBy({
        username: dto.username,
      });
      if (checkUser) {
        throw new Error('Tài khoản đã tồn tại');
      }
      const hashPwd = await bcrypt.hash(dto.password, 10);
      dto.password = hashPwd;
      const user = plainToClass(UserEntity, dto);
      const result = await userRepositoryTransaction.save(user);
      const accessToken = '1';
      const refreshToken = '2';
      await this.managerTransaction.commit();
      return new BaseResponse(
        'Đăng ký tài khoản thành công',
        {
          username: result.username,
          uuid: result.uuid,
          accessToken,
          refreshToken,
        },
        200,
      );
    } catch (error) {
      await this.managerTransaction.rollBack();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(dto: LoginDto): Promise<BaseResponse> {
    try {
      const checkUser = await this.userRepository.findOneBy({
        username: dto.username,
      });
      if (!checkUser) {
        throw new Error('Tài khoản không tồn tại');
      }
      const isMatch = await bcrypt.compare(dto.password, checkUser.password);
      if (!isMatch) {
        throw new Error('Mật khẩu không chính xác');
      }
      const accessToken = 'AT';
      const refreshToken = 'RT';
      return new BaseResponse(
        'Đăng nhập thành công',
        {
          username: checkUser.username,
          uuid: checkUser.uuid,
          accessToken,
          refreshToken,
        },
        200,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }
  async findOne(username: string) {
    return await this.userRepository.findOneBy({
      username: username,
    });
  }
}
