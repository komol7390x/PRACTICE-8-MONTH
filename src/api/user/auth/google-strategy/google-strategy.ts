// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-google-oauth20';
// import { VerifiedCallback } from 'passport-jwt';
// import { AuthService } from '../auth.service';
// import { appConfig } from 'src/config';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//     constructor(
//         private authService: AuthService,
//     ) {
//         super({
//             clientID: appConfig.GOOGLE.ID,
//             clientSecret: appConfig.GOOGLE.SECRET_KEY,
//             callbackURL: appConfig.GOOGLE.CALLBACK_URL,
//             scope: [
//                 'email',
//                 'profile',
//                 'https://www.googleapis.com/auth/calendar',
//                 'https://www.googleapis.com/auth/calendar.events',
//             ],
//             responseType: 'code',
//             accessType: 'offline', // Required for refresh token
//             prompt: 'consent', // Force consent screen to get refresh token
//             includeGrantedScopes: true,
//             approvalPrompt: 'force', // Force re-approval (legacy param, but helps with refresh token)
//         });
//     }

//     async validate(
//         accessToken: string,
//         refreshToken: string,
//         profile: any,
//         done: VerifiedCallback,
//     ) {
//         const { displayName: name, emails, id: googleId, photos } = profile;

//         // Refresh token olib bo'lmagan bo'lsa, xatolikni log qilish
//         if (!refreshToken) {
//             console.warn(
//                 '⚠️ Refresh token is missing! This might be because:',
//                 '\n1. App is in testing mode and user is not in test users list',
//                 '\n2. User already granted consent before and prompt was not shown',
//                 '\n3. App verification is pending in Google Console',
//                 '\n4. User revoked access and re-authorized without offline access',
//                 '\n5. OAuth consent screen is not properly configured',
//                 '\n\n💡 Solutions:',
//                 '\n- Add user to test users list in Google Console',
//                 '\n- Revoke access in Google Account settings and try again',
//                 '\n- Ensure OAuth consent screen is properly configured',
//                 '\n- For production: Complete app verification in Google Console',
//             );

//             // Warning log for production debugging
//             if (config.NODE_ENV === 'production') {
//                 console.error(
//                     `❌ CRITICAL: Refresh token missing for user ${emails?.[0]?.value || googleId}`,
//                 );
//             }
//         } else {
//             console.log(
//                 `✅ Refresh token received successfully for user ${emails?.[0]?.value || googleId}`,
//             );
//         }

//         let user = await this.prisma.teacher.findUnique({ where: { googleId } });

//         if (!user) {
//             // Yangi teacher yaratish - Step 1
//             // Refresh token bo'lmasa ham saqlaymiz, keyin qayta consent berish mumkin
//             user = await this.prisma.teacher.create({
//                 data: {
//                     name,
//                     googleId,
//                     email: emails?.[0]?.value ?? '',
//                     image: photos?.[0]?.value ?? '',
//                     googleAccessToken: accessToken,
//                     googleRefreshToken: refreshToken || null, // null bo'lishi mumkin
//                 },
//             });

//             // Yangi teacher uchun Step 2 ga yo'naltirish
//             done(null, {
//                 user: {
//                     id: user.id,
//                     name: user.name,
//                     email: user.email,
//                 },
//                 step: 2,
//                 message: 'Step 1 completed. Please provide phone number and password.',
//             });
//             return;
//         }

//         // Mavjud teacher uchun Google tokenlarni yangilash
//         // Refresh token yangi bo'lsa yoki yo'q bo'lsa ham yangilaymiz
//         const updateData: any = {
//             googleAccessToken: accessToken,
//         };

//         // Refresh token yangi bo'lsa yoki mavjud bo'lsa yangilaymiz
//         if (refreshToken) {
//             updateData.googleRefreshToken = refreshToken;
//             console.log(
//                 `✅ Refresh token updated for user ${emails?.[0]?.value || googleId}`,
//             );
//         } else {
//             // Refresh token yo'q bo'lsa, mavjud refresh token'ni saqlaymiz (o'chirmaymiz)
//             // Lekin agar mavjud refresh token ham yo'q bo'lsa, warning beramiz
//             if (!user.googleRefreshToken) {
//                 console.warn(
//                     `⚠️ No refresh token received and user ${emails?.[0]?.value || googleId} doesn't have existing refresh token.`,
//                 );
//             } else {
//                 console.log(
//                     `ℹ️ No new refresh token received, keeping existing refresh token for ${emails?.[0]?.value || googleId}`,
//                 );
//             }
//         }

//         await this.prisma.teacher.update({
//             where: { id: user.id },
//             data: updateData,
//         });

//         // Registration holatini tekshirish
//         if (!user.phone || !user.password) {
//             // Step 2 ga yo'naltirish
//             done(null, {
//                 user: {
//                     id: user.id,
//                     name: user.name,
//                     email: user.email,
//                 },
//                 step: 2,
//                 message: 'Registration incomplete. Please complete step 2.',
//             });
//             return;
//         }

//         // To'liq ro'yxatdan o'tgan - login qilish
//         if (!user.isActive) {
//             done(null, {
//                 user: {
//                     id: user.id,
//                     name: user.name,
//                     email: user.email,
//                 },
//                 step: 'inactive',
//                 message:
//                     'Your account is not activated yet. Please wait for admin approval.',
//             });
//             return;
//         }

//         // Muvaffaqiyatli login
//         done(null, {
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//             },
//             step: 'completed',
//             message: 'Teacher logged in successfully',
//         });
//     }
// }
