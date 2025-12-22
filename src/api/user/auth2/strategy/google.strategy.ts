import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3030/api/v1/auth/google/callback',
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/photoslibrary.readonly',
            ],
            accessType: 'offline',
            prompt: 'consent',
            // TypeScript xatosini oldini olish uchun 'as any' yoki 
            // obyektni alohida kasting qilish kerak:
        } as any);
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken); // Bu yerda chiqishi kerak

        if (!refreshToken) {
            console.warn('Eslatma: Refresh token kelmadi. Bu odatda "prompt: consent" yoqligida yoki ruxsat olinganida sodir bo\'ladi.');
  }

        const user = {
            googleId: profile.id,
            email: profile.emails[0].value,
            accessToken,
            refreshToken,
        };
        done(null, user);
    }
}