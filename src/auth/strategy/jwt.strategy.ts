import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/entity/users.entity'
import { Repository } from 'typeorm'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor (
    configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_TOKEN'),
    })
  }

  async validate (payload: any): Promise<any> {
    const user = await this.userRepository.findOneBy({ uuid: payload.uuid })
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
