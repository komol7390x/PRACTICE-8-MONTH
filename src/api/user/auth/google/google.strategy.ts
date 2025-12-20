import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { appConfig } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        const google = appConfig.GOOGLE;

        if (!google.ID || !google.SECRET_KEY || !google.CALLBACK_URL) {
            throw new Error(`
            Google OAuth environment variables are not defined.
            Please check your .env file:
            GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
            `);
        }

        super({
            clientID: google.ID as string,
            clientSecret: google.SECRET_KEY as string,
            callbackURL: google.CALLBACK_URL as string,
            scope: ['email', 'profile'],
            passReqToCallback: false,
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ) {
        return {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            picture: profile.photos?.[0]?.value,
        };
    }
}
