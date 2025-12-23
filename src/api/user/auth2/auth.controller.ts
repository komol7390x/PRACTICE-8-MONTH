import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { type Response, type Request } from 'express';
import passport from 'passport';
import { appConfig } from 'src/config';
import { Roles } from 'src/common/enum/roles.enum';
import { TokenName } from 'src/common/enum/token-name';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Get('google')
    googleLogin(@Req() req: Request, @Res() res: Response) {
        passport.authenticate(
            'google',
            {
                scope: [
                    'email',
                    'profile',
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/calendar.events',
                ],
                accessType: 'offline',
                prompt: 'consent',
            } as passport.AuthenticateOptions,
            (err: any, user: any, info: any) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: 'Authentication failed', details: err });
                }
                if (!user) {
                    return res.status(401).json({ error: 'No user found', info });
                }

                req.logIn(user, (loginErr: any) => {
                    if (loginErr) {
                        return res
                            .status(500)
                            .json({ error: 'Login failed', details: loginErr });
                    }
                    return res.redirect('/');
                });
            },
        )(req, res);
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req, @Res() res) {

        const { item, step } = req.user;
        // Agar step 2 bo'lsa
        if (step == 2) {
            await this.authService.generateTokens(item.id, item.role, item.isActive, res)
            return res.redirect(
                `${appConfig.FRONT_URL}/auth/teacher/register/step2/${item.id}`,
            );
        }

        // // Agar step 'completed' bo'lsa, tokenlarni yaratamiz va cookies ga saqlaymiz
        if (step === 'completed') {
            // const jwtTokens = this.authService.generateTokens(item.id, Roles.TEACHER);

            // res.cookie(TokenName.TEACHER_TOKEN, jwtTokens.access_token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     maxAge: 60 * 60 * 1000,
            //     path: '/',
            // });

            // res.cookie('refresh_token', jwtTokens.refresh_token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     maxAge: 60 * 60 * 1000,
            //     path: '/',
            // });

            // Teacher dashboard'ga redirect
            return res.redirect(`${appConfig.FRONT_URL}/`);
        }

        // // Agar account inactive bo'lsa
        if (step === 'inactive') {
            // const jwtTokens = this.authService.generateTokens(item.id, 'TEACHER');

            // res.cookie('access_token', jwtTokens.access_token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     maxAge: 300000,
            //     path: '/',
            // });

            // res.cookie('refresh_token', jwtTokens.refresh_token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'lax',
            //     maxAge: true,
            //     path: '/',
            // });

            return res.redirect(
                `${appConfig.FRONT_URL}/login/teacher?error=account_inactive`,
            );
        }

        // Default redirect
        return res.redirect(`${appConfig.FRONT_URL}/login/teacher?error=unknown_step`);
    }
}