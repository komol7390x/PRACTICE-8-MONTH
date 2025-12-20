import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

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
