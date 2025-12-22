// import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { ApiOperation, ApiResponse } from '@nestjs/swagger';
// import type { Response, Request } from 'express';
// import passport from 'passport';
// import { AuthGuard } from '@nestjs/passport';
// import { appConfig } from 'src/config';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) { }

//   // Google OAuth endpoints
//   @Get('google')
//   @ApiOperation({ summary: 'Google OAuth login' })
//   googleLogin(@Req() req: Request, @Res() res: Response) {
//     // Custom authenticate with prompt=consent to force refresh token
//     passport.authenticate(
//       'google',
//       {
//         scope: [
//           'email',
//           'profile',
//           'https://www.googleapis.com/auth/calendar',
//           'https://www.googleapis.com/auth/calendar.events',
//         ],
//         accessType: 'offline',
//         prompt: 'consent',
//       } as passport.AuthenticateOptions,
//       (err, user, info) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ error: 'Authentication failed', details: err });
//         }
//         if (!user) {
//           return res.status(401).json({ error: 'No user found', info });
//         }

//         // Manually log in the user
//         req.logIn(user, (loginErr) => {
//           if (loginErr) {
//             return res
//               .status(500)
//               .json({ error: 'Login failed', details: loginErr });
//           }
//           return res.redirect('/dashboard'); // yoki kerakli joyga yo'naltiring
//         });
//       },
//     )(req, res);
//   }


//   @Get('google/callback')
//   @UseGuards(AuthGuard('google'))
//   @ApiOperation({ summary: 'Google OAuth callback' })
//   @ApiResponse({ status: 200, description: 'Google authentication successful' })
//   googleCallback(@Req() req, @Res() res) {
//     const { user, step } = req.user;
//     console.log(req.user);

//     // if (step == 2) {
//     //   return res.redirect(
//     //     `${appConfig.FRONT_URL}/auth/teacher/register/step2/${user.id}`,
//     //   );
//     // }

//     // Agar step 'completed' bo'lsa, tokenlarni yaratamiz va cookies ga saqlaymiz
//     // if (step === 'completed') {
//     //   const jwtTokens = this.authService.generateTokens(user.id, 'TEACHER');

//     //   res.cookie('access_token', jwtTokens.access_token, {
//     //     httpOnly: true,
//     //     secure: true,
//     //     sameSite: 'lax',
//     //     maxAge: 24 * 60 * 60 * 1000,
//     //     path: '/',
//     //   });

//     //   res.cookie('refresh_token', jwtTokens.refresh_token, {
//     //     httpOnly: true,
//     //     secure: true,
//     //     sameSite: 'lax',
//     //     maxAge: 30 * 24 * 60 * 60 * 1000,
//     //     path: '/',
//     //   });

//     //   // Teacher dashboard'ga redirect
//     //   return res.redirect(`${appConfig.FRONT_URL}/teacher/dashboard`);
//     // }

//     // Agar account inactive bo'lsa
//     // if (step === 'inactive') {
//     //   const jwtTokens = this.authService.generateTokens(user.id, 'TEACHER');

//     //   res.cookie('access_token', jwtTokens.access_token, {
//     //     httpOnly: true,
//     //     secure: true,
//     //     sameSite: 'lax',
//     //     maxAge: 24 * 60 * 60 * 1000,
//     //     path: '/',
//     //   });

//     //   res.cookie('refresh_token', jwtTokens.refresh_token, {
//     //     httpOnly: true,
//     //     secure: true,
//     //     sameSite: 'lax',
//     //     maxAge: 30 * 24 * 60 * 60 * 1000,
//     //     path: '/',
//     //   });

//     //   return res.redirect(
//     //     `${appConfig.FRONT_URL}/login/teacher?error=account_inactive`,
//     //   );
//     // }

//     // Default redirect
//     return res.redirect(`${appConfig.FRONT_URL}/login/teacher?error=unknown_step`);
//   }

// }
