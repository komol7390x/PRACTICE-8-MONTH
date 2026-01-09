import {
  CanActivate,
  ExecutionContext,
  Injectable,
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
    const token =
      req.cookies?.[TokenName.ADMIN_TOKEN] ||
      req.cookies?.[TokenName.TEACHER_TOKEN] ||
      this.extractTokenFromHeader(req) ||
      req.query?.token;

    if (!token) throw new UnauthorizedException('Token topilmadi');

    try {
      const data = this.jwt.verify(token, {
        secret: appConfig.TOKEN.ACCESS_TOKEN_KEY,
      });

      req.user = data;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
