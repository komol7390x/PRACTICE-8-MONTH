import { Module, Global } from '@nestjs/common';
import { MailService } from './send-otp-email';

@Global() 
@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }