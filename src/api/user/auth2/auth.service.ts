import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async validateGoogleUser(googleUser: any) {
        // 1. Bazadan googleUser.email orqali foydalanuvchini qidirasiz
        // 2. Agar yo'q bo'lsa, yangi foydalanuvchi yaratasiz (googleId, email, va h.k.)
        // 3. Google refreshToken-ni bazada saqlab qo'yishingiz shart (keyinchalik Calendar uchun kerak bo'ladi)

        return googleUser; // Hozircha qaytarib turamiz
    }

    generateTokens(userId: number, role: string) {
        const payload = { sub: userId, role };
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
}