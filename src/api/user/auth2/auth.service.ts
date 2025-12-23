import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Response } from 'express';
import { TokenName } from 'src/common/enum/token-name';
import { appConfig } from 'src/config';
import { TokenService } from 'src/infrastructure/token/Token';

@Injectable()
export class AuthService {
    constructor(private readonly tokenService: TokenService,) { }

    async validateGoogleUser(googleUser: any) {
        return googleUser;
    }

    async generateTokens(id: number, role: string, isActive: boolean, res: Response) {
        const payload = {
            id, role, isActive
        }
        const accessToken = await this.tokenService.accessToken(payload)

        res.clearCookie(TokenName.ADMIN_TOKEN)
        res.clearCookie(TokenName.TEACHER_TOKEN)
        res.clearCookie(TokenName.STUDENT_TOKEN)

        await this.tokenService.writeCookie(
            res,
            TokenName.TEACHER_TOKEN,
            accessToken,
            appConfig.TOKEN.ACCESS_TOKEN_TIME)
    }
}
