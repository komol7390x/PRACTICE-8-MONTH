import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { type Response, type Request } from 'express';
import { appConfig } from 'src/config';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Get('google')
    // @UseGuards(AuthGuard('google'))
    googleLogin(@Res() res:Response) {
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', appConfig.GOOGLE.ID as string);
        url.searchParams.set('redirect_uri', 'http://localhost:3030/api/v1/auth/google/callback');
        url.searchParams.set('scope', 'email profile https://www.googleapis.com/auth/calendar.events');
        url.searchParams.set('access_type', 'offline'); // Refresh token uchun
        url.searchParams.set('prompt', 'consent');    // Majburiy ruxsat oynasi

        return res.redirect(url.toString());
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        // Google-dan qaytgan ma'lumotlar req.user ichida bo'ladi
        const googleUser = req.user;

        // Foydalanuvchini bazaga saqlash/yangilash
        const user = await this.authService.validateGoogleUser(googleUser);

        // O'zimizning JWT tokenlarni yaratamiz
        const tokens = this.authService.generateTokens(user.id || 1, 'TEACHER');

        // Cookiega saqlash
        res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000, // 1 soat
        });

        // Frontend-ga redirect
        return res.redirect('http://localhost:3000/dashboard');
    }
}