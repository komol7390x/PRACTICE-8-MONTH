import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { type Response } from 'express';
import { Roles } from 'src/common/enum/roles.enum';
import { TokenName } from 'src/common/enum/token-name';
import { appConfig } from 'src/config';
import { TokenService } from 'src/infrastructure/token/Token';
import { TeacherEntity } from '../teacher/entities/teacher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
        private readonly tokenService: TokenService,
    ) { }

    async validateGoogleUser(googleUser: any) {
        return googleUser;
    }

    async generateTokens(id: number, res: Response) {
        const payload = {
            id, role: Roles.TEACHER, isActive: true
        }
        const accessToken = await this.tokenService.accessToken(payload)
        res.clearCookie(TokenName.ADMIN_TOKEN)
        res.clearCookie(TokenName.TEACHER_TOKEN)
        res.clearCookie(TokenName.STUDENT_TOKEN)

        return this.tokenService.writeCookie(
            res,
            TokenName.TEACHER_TOKEN,
            accessToken,
            appConfig.TOKEN.ACCESS_TOKEN_TIME)
    }

    async refreshGoogleToken(teacherId: number) {
        const teacher = await this.teacherRepo.findOne({
            where: {
                id: teacherId,
                isDeleted: false,
                isActive: true
            }
        });

        if (!teacher || !teacher.googleRefreshToken) {
            throw new UnauthorizedException('Refresh token topilmadi yoki hisob faol emas. Qayta login qiling.');
        }

        try {
            // 2. Google API ga so'rov
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: teacher.googleRefreshToken,
                grant_type: 'refresh_token',
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const newAccessToken = response.data.access_token;

            // 3. Yangi tokenni bazada saqlash
            await this.teacherRepo.update(teacherId, {
                googleAccessToken: newAccessToken,
            });

            return newAccessToken;

        } catch (error) {
            // 4. Xatoliklarni ushlash va tushunarli log qilish
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                console.error('❌ Google serveri bilan aloqa juda sekin (Timeout).');
                throw new Error('Google serveriga ulanish vaqti tugadi. Internetni tekshiring.');
            }

            if (error.response) {
                // Google qaytargan aniq xatolik (masalan: 400 invalid_grant)
                console.error('❌ Google API xatosi:', error.response.data);
                throw new UnauthorizedException(`Google xatosi: ${error.response.data.error_description || error.response.data.error}`);
            }

            console.error('❌ Kutilmagan xatolik:', error.message);
            throw new Error('Tokenni yangilashda texnik xatolik yuz berdi.');
        }
    }
}
