import { Injectable } from '@nestjs/common';
import { type Response } from 'express';
import { Roles } from 'src/common/enum/roles.enum';
import { TokenName } from 'src/common/enum/token-name';
import { appConfig } from 'src/config';
import { TokenService } from 'src/infrastructure/token/Token';

@Injectable()
export class AuthService {
    constructor(private readonly tokenService: TokenService,) { }

    async validateGoogleUser(googleUser: any) {
        return googleUser;
    }

    async generateTokens(id: number, res: Response) {
        console.log(200001);

        const payload = {
            id, role: Roles.TEACHER, isActive: true
        }
        console.log(1111);

        const accessToken = await this.tokenService.accessToken(payload)
        console.log(222);

        res.clearCookie(TokenName.ADMIN_TOKEN)
        res.clearCookie(TokenName.TEACHER_TOKEN)
        res.clearCookie(TokenName.STUDENT_TOKEN)

        return this.tokenService.writeCookie(
            res,
            TokenName.TEACHER_TOKEN,
            accessToken,
            appConfig.TOKEN.ACCESS_TOKEN_TIME)
    }
}
