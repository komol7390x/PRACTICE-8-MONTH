import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Yoki boshqa SMTP (masalan, Mailgun, SendGrid)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // 6 xonali tasodifiy OTP yaratish
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtpEmail(email: string, otp: number) {
        const mailOptions = {
            from: `"Loyiha Nomi" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Tasdiqlash kodi',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333;">Tasdiqlash kodi</h2>
          <p>Sizning 6 xonali tasdiqlash kodingiz:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>Ushbu kod 5 daqiqa davomida amal qiladi. Uni hech kimga bermang.</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            throw new InternalServerErrorException("Email yuborishda xatolik yuz berdi");
        }
    }
}