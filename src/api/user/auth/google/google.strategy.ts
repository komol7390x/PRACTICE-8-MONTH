import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import fetch from 'node-fetch';
import { appConfig } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        const google = appConfig.GOOGLE;

        super({
            clientID: google.ID as string,
            clientSecret: google.SECRET_KEY as string,
            callbackURL: google.CALLBACK_URL as string,
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/user.phonenumbers.read',
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events',
            ],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ) {
        // Telefon raqami
        const phoneRes = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );
        const phoneData = (await phoneRes.json()) as { phoneNumbers?: { value: string }[] };
        const phone = phoneData.phoneNumbers?.[0]?.value || null;

        // Calendar eventlari
        const calendarRes = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );
        const calendarData = (await calendarRes.json()) as { items?: any[] };
        const calendarEvents = calendarData.items || [];

        return {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            picture: profile.photos?.[0]?.value,
            phone,
            calendarEvents,
            accessToken,
        };
    }

}
