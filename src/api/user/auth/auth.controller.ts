import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { type Response, type Request } from 'express';
import passport from 'passport';
import { appConfig } from 'src/config';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Get('google')
    @ApiOperation({ summary: 'registration with google' })
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
            await this.authService.generateTokens(item.id, res)
            return res.redirect(
                `${appConfig.FRONT_URL}/auth/teacher/register/step2/${item.id}`,
            );
        }

        // // Agar step 'completed' bo'lsa, tokenlarni yaratamiz va cookies ga saqlaymiz
        if (step === 'completed') {
            await this.authService.generateTokens(item.id, res)
            // Teacher dashboard'ga redirect
            return res.redirect(`${appConfig.FRONT_URL}/teacher/dashboard`);
        }

        // // Agar account inactive bo'lsa
        if (step === 'inactive') {
            await this.authService.generateTokens(item.id, res)
            return res.redirect(
                `${appConfig.FRONT_URL}/login/teacher?error=account_inactive`,
            );
        }

        // Default redirect
        return res.redirect(`${appConfig.FRONT_URL}/login/teacher?error=unknown_step`);
    }
}