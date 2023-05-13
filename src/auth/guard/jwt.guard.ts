import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { SetMetadata } from '@nestjs/common'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor (private reflector: Reflector) {
    super()
  }

  canActivate (context: ExecutionContext) {
    const isPublic = this.reflector.get<string>('public', context.getHandler())
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }
}

export const PublicEndpoint = () => SetMetadata('public', true)
