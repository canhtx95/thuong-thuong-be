import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { BaseResponse } from 'src/common/response/base.response';
import {
    BadRequestException,
    Injectable,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly usersService: UsersService,
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userRepository.findOneBy({ username });
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(dto: LoginDto): Promise<BaseResponse> {
        try {
            const checkUser = await this.userRepository.findOneBy({ username: dto.username });
            if (!checkUser) {
                throw new Error('Tài khoản không chính xác');
            }
            const isMatch = await bcrypt.compare(dto.password, checkUser.password);
            if (!isMatch) {
                throw new Error('Mật khẩu không chính xác');
            }
            const accessToken = await this.convertToJwtString(checkUser.uuid, dto.username, `this.configService.get('ACCESS_TOKEN')`);
            const refreshToken = await this.convertToJwtString(checkUser.uuid, dto.username, `this.configService.get('ACCESS_TOKEN')`);
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
        // return this.convertToJwtString(1, dto.username)
    }
    async convertToJwtString(userId: string, username: string, secret: string): Promise<string> {
        const payload = {
            uuid: userId,
            username
        }
        return this.jwtService.sign(payload, {
            secret: secret,
        })
    }
}