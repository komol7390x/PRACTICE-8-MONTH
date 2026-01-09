import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherEntity } from '../../teacher/entities/teacher.entity';
import { Repository } from 'typeorm';
import { appConfig } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${appConfig.FRONT_URL}/teacher/google/step-2`,
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/photoslibrary.readonly',
            ],
            responseType: 'code',
            accessType: 'offline',
            prompt: 'consent',
            includeGrantedScopes: true,

        } as any);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback) {
        if (!refreshToken) {
            console.warn(
                '⚠️ Refresh token is missing! This might be because:',
                '\n1. App is in testing mode and user is not in test users list',
                '\n2. User already granted consent before and prompt was not shown',
                '\n3. App verification is pending in Google Console',
                '\n4. User revoked access and re-authorized without offline access',
                '\n5. OAuth consent screen is not properly configured',
                '\n\n💡 Solutions:',
                '\n- Add user to test users list in Google Console',
                '\n- Revoke access in Google Account settings and try again',
                '\n- Ensure OAuth consent screen is properly configured',
                '\n- For production: Complete app verification in Google Console',
            );
        }

        const { displayName: name, emails, id: googleId, photos } = profile;
        const findUser = await this.teacherRepo.findOne({ where: { googleId } })

        if (!findUser) {
            const newUser = await this.teacherRepo.save(this.teacherRepo.create({
                email: profile.emails[0].value,
                fullname: name,
                imageUrl: photos || '',
                googleId,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken ?? undefined,
                isActive: false
            }))

            const user = {
                item: {
                    id: newUser.id,
                    name: newUser?.fullname,
                    googleId: newUser.googleId,
                    email: newUser.email,
                },
                step: 2,
                message: 'Step 1 completed. Please provide phone number and password.',
            }
            return done(null, user);
        }

        const updateData: any = {
            googleAccessToken: accessToken,
        };
        if (refreshToken) {
            updateData.googleRefreshToken = refreshToken;
            console.log(
                `✅ Refresh token updated for user ${emails?.[0]?.value || googleId}`,
            );
        } else {
            if (!findUser?.googleRefreshToken) {
                console.warn(
                    `⚠️ No refresh token received and user ${emails?.[0]?.value || googleId} doesn't have existing refresh token.`,
                );
            } else {
                console.log(
                    `ℹ️ No new refresh token received, keeping existing refresh token for ${emails?.[0]?.value || googleId}`,
                );
            }
        }

        await this.teacherRepo.update({ id: findUser.id }, {
            googleAccessToken: updateData.accessToken,
            googleRefreshToken: updateData.googleRefreshToken
        })

        if (!findUser.phoneNumber || !findUser.password) {
            done(null, {
                item: {
                    id: findUser.id,
                    name: findUser.fullname,
                    email: findUser.email,
                },
                step: 2,
                message: 'Registration incomplete. Please complete step 2.',
            });
            return;
        }

        if (!findUser.isActive) {
            done(null, {
                item: {
                    id: findUser.id,
                    name: findUser.fullname,
                    email: findUser.email,
                },
                step: 'inactive',
                message:
                    'Your account is not activated yet. Please wait for admin approval.',
            });
            return;
        }
        done(null, {
            item: {
                id: findUser.id,
                name: findUser.fullname,
                email: findUser.email,
            },
            step: 'completed',
            message: 'Teacher logged in successfully',
        });

    }
}
