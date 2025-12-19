import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/config';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { TokenName } from '../enum/token-name';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private reflector: Reflector,
  ) { }

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (roles?.includes('public')) return true;

    const req = ctx.switchToHttp().getRequest();
    const cookiesToken =
      req.cookies?.[TokenName.ADMIN_TOKEN] ||
      req.cookies?.[TokenName.TEACHER_TOKEN];
    if (cookiesToken) {
      const data = this.jwt.verify(cookiesToken, {
        secret: appConfig.TOKEN.ACCESS_TOKEN_KEY,
      });
      if (data) {
        req.user = data
        return true
      }
    }

    const auth = req.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      const data = this.jwt.verify(token, {
        secret: appConfig.TOKEN.ACCESS_TOKEN_KEY,
      });
      req.user = data;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }
}
