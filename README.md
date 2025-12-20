# NestJS Google Auth - To'liq Qadamma-Qadam Qo'llanma

## QADAM 1: Yangi NestJS Loyiha Yaratish

```bash
# NestJS CLI o'rnatish (agar yo'q bo'lsa)
npm i -g @nestjs/cli

# Yangi loyiha yaratish
nest new my-google-auth

# Loyihaga kirish
cd my-google-auth
```

## QADAM 2: Kerakli Paketlarni O'rnatish

```bash
npm install @nestjs/passport passport passport-google-oauth20
npm install @nestjs/jwt passport-jwt
npm install @nestjs/config
npm install -D @types/passport-google-oauth20 @types/passport-jwt
```

## QADAM 3: Papka Strukturasini Yaratish

```bash
# Auth papkasini yaratish
mkdir src/auth
mkdir src/auth/guards

# Fayllarni yaratish
touch src/auth/auth.module.ts
touch src/auth/auth.service.ts
touch src/auth/auth.controller.ts
touch src/auth/google.strategy.ts
touch src/auth/jwt.strategy.ts
touch src/auth/guards/google-auth.guard.ts
touch src/auth/guards/jwt-auth.guard.ts
```

## QADAM 4: .env Faylini Yaratish

Loyihaning ildiz papkasida `.env` fayl yarating:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
JWT_SECRET=my-super-secret-jwt-key-12345
```

## QADAM 5: Google Cloud Console Sozlash

### 5.1 Google Cloud Console'ga kirish
1. Brauzerda oching: https://console.cloud.google.com
2. Google akkauntingiz bilan kiring

### 5.2 Yangi Project yaratish
1. Yuqori chap burchakda **"Select a project"** bosing
2. **"NEW PROJECT"** tugmasini bosing
3. Project nomi: `my-auth-project` (istalgan nom)
4. **"Create"** bosing

### 5.3 OAuth Consent Screen sozlash
1. Chap menuda: **"APIs & Services"** → **"OAuth consent screen"**
2. **"External"** tanlang → **"CREATE"**
3. To'ldiring:
   - App name: `My App`
   - User support email: o'z emailingiz
   - Developer contact: o'z emailingiz
4. **"SAVE AND CONTINUE"**
5. Scopes: **"SAVE AND CONTINUE"** (hech narsa qo'shmasdan)
6. Test users: **"ADD USERS"** → o'z emailingizni qo'shing
7. **"SAVE AND CONTINUE"**

### 5.4 OAuth Client ID yaratish
1. **"APIs & Services"** → **"Credentials"**
2. **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Application type: **"Web application"**
4. Name: `My Auth Client`
5. **Authorized redirect URIs** → **"+ ADD URI"**
   ```
   http://localhost:3000/auth/google/callback
   ```
6. **"CREATE"** bosing

### 5.5 Client ID va Secret olish
1. Popup oynada **"Client ID"** va **"Client Secret"** ni ko'ring
2. Bu ikkalasini ko'chirib `.env` fayliga qo'ying:
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
   ```

## QADAM 6: Kodlarni Yozish

### 6.1 google.strategy.ts

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value || '',
    };

    done(null, user);
  }
}
```

### 6.2 jwt.strategy.ts

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
```

### 6.3 auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.googleId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }
}
```

### 6.4 guards/google-auth.guard.ts

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
```

### 6.5 guards/jwt-auth.guard.ts

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 6.6 auth.controller.ts

```typescript
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Avtomatik Google'ga redirect qiladi
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    // Google login qilgandan keyin bu yerga keladi
    return this.authService.login(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    // JWT token bilan user ma'lumotlarini qaytaradi
    return {
      message: 'Siz login qildingiz!',
      user: req.user,
    };
  }
}
```

### 6.7 auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}
```

### 6.8 app.module.ts o'zgartirish

`src/app.module.ts` faylini yangilang:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
```

### 6.9 main.ts o'zgartirish

`src/main.ts` faylini yangilang:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS yoqish (frontend uchun)
  app.enableCors();
  
  await app.listen(3000);
  console.log('✅ Backend ishga tushdi: http://localhost:3000');
  console.log('🔐 Google login: http://localhost:3000/auth/google');
}
bootstrap();
```

## QADAM 7: Ishga Tushirish

```bash
npm run start:dev
```

Konsolda ko'rasiz:
```
✅ Backend ishga tushdi: http://localhost:3000
🔐 Google login: http://localhost:3000/auth/google
```

## QADAM 8: Test Qilish

### 8.1 Brauzerda Login
1. Brauzerni oching
2. Kirish: `http://localhost:3000/auth/google`
3. Google akkauntingizni tanlang
4. Ruxsat bering
5. Natija: JWT token va user ma'lumotlari JSON formatda

**Javob misoli:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwic3ViIjoiMTIzNDU2Nzg5IiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiaWF0IjoxNzM0NzAwMDAwLCJleHAiOjE3MzUzMDQ4MDB9.abcdef123456",
  "user": {
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "picture": "https://lh3.googleusercontent.com/a/..."
  }
}
```

### 8.2 Token bilan API Test
1. Yuqoridagi `access_token` ni nusxa oling
2. Postman yoki curl bilan:

**Postman:**
```
GET http://localhost:3000/auth/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Curl:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/auth/me
```

**Javob:**
```json
{
  "message": "Siz login qildingiz!",
  "user": {
    "id": "123456789",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## QADAM 9: Frontend bilan Ishlash (Ixtiyoriy)

Agar frontend'ingiz bo'lsa (React, Vue, Angular):

### 9.1 Login tugmasi
```javascript
function LoginButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };
  
  return <button onClick={handleLogin}>Login with Google</button>;
}
```

### 9.2 Callback sahifa (misol: /auth/callback)
```javascript
useEffect(() => {
  // URL'dan token olish
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Token'ni saqlash
    localStorage.setItem('access_token', token);
    // Asosiy sahifaga yo'naltirish
    window.location.href = '/dashboard';
  }
}, []);
```

### 9.3 API so'rovlar
```javascript
async function getProfile() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data);
}
```

## ISHLASH JARAYONI (Flow)

```
1. User: "Login with Google" tugmasini bosadi
   ↓
2. Browser: http://localhost:3000/auth/google ga kiradi
   ↓
3. Backend: Google login sahifasiga redirect qiladi
   ↓
4. User: Google akkauntini tanlaydi va ruxsat beradi
   ↓
5. Google: http://localhost:3000/auth/google/callback ga qaytaradi
   ↓
6. Backend: User ma'lumotlarini oladi va JWT token yaratadi
   ↓
7. Browser: JSON formatda token va user ma'lumotlarini ko'rsatadi
   ↓
8. Frontend: Token'ni localStorage'ga saqlaydi
   ↓
9. Frontend: Keyingi har bir API so'rovda token'ni yuboradi
   ↓
10. Backend: Token'ni tekshiradi va javob beradi
```

## MUAMMOLAR VA YECHIMLAR

### Muammo 1: "redirect_uri_mismatch"
**Yechim:** Google Console'da redirect URI ni to'g'ri kiriting:
```
http://localhost:3000/auth/google/callback
```

### Muammo 2: "unauthorized_client"
**Yechim:** 
1. OAuth consent screen to'ldirilganmi?
2. Test users qo'shilganmi?

### Muammo 3: Token ishlamayapti
**Yechim:** 
1. JWT_SECRET to'g'ri kiritilganmi?
2. Token'ni to'g'ri formatda yuborasizmi? `Bearer TOKEN`

### Muammo 4: CORS xatosi
**Yechim:** `main.ts` da `app.enableCors()` yozilganmi?

## XAVFSIZLIK MASLAHATLAR

1. ✅ `.env` faylini `.gitignore` ga qo'shing
2. ✅ Production'da HTTPS ishlating
3. ✅ JWT secret'ni murakkab qiling
4. ✅ Token expiration vaqtini qisqa qiling (1-7 kun)

---

## QISQA QILIB

```bash
# 1. Loyiha yaratish
nest new my-app && cd my-app

# 2. Paketlar
npm install @nestjs/passport passport passport-google-oauth20 @nestjs/jwt passport-jwt @nestjs/config
npm install -D @types/passport-google-oauth20 @types/passport-jwt

# 3. Kodlarni yozish (yuqoridagi fayllar)

# 4. Google Console'da sozlash

# 5. Ishga tushirish
npm run start:dev

# 6. Test
http://localhost:3000/auth/google
```

Tayyor! ✅
