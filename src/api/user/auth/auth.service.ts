import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/config';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async login(user: any) {
    const payload = { sub: user.googleId, email: user.email };

    return {
      access_token: this.jwtService.sign(payload, { secret: appConfig.GOOGLE.JWT_SECRET as string }),
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        phone: user.phone,
        calendarEvents: user.calendarEvents,
      },
    };
  }
}
