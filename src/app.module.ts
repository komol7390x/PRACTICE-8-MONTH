import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from 'src/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './api/user/admin/admin.module';
import { TeacherModule } from './api/user/teacher/teacher.module';
import { StudentModule } from './api/user/student/student.module';
import { PaymentModule } from './api/product/payment/payment.module';
import { StatisticaModule } from './api/product/statistica/statistica.module';
import { CertificateModule } from './api/product/certificate/certificate.module';
import { LessonTemplateModule } from './api/product/lesson-template/lesson-template.module';
import { NotificationModule } from './api/product/notification/notification.module';
import { AuthModule } from './api/user/auth/auth.module';
import { BotModule } from '../bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { ScheduleModule } from '@nestjs/schedule';
import { CourseModule } from './api/product/course/course.module';
import { ScheduleTeacherModule } from './api/product/schedule/schedule.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env', // Agar ildiz papkada bo'lsa shunday qoladi
        }),
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),

        TypeOrmModule.forRootAsync({
            useFactory: async () => {
                try {
                    console.log('⏳ Connecting to PostgreSQL...');

                    return {
                        type: 'postgres',
                        host: appConfig.DATABASE.HOST,
                        port: appConfig.DATABASE.PORT,
                        username: appConfig.DATABASE.USER,
                        password: appConfig.DATABASE.PASS,
                        database: appConfig.DATABASE.NAME,
                        entities: [],
                        supportBigNumbers: true,
                        bigNumberStrings: false,
                        synchronize: true,
                        autoLoadEntities: true,
                        migrationsRun: false,
                        migrations: [process.cwd() + '/migrations/*{.ts,.js}'],
                        logging: process.env.NODE_ENV === 'development',
                        timezone: '-03:00'
                    };
                } catch (err) {
                    console.error('❌ PostgreSQL connection failed:', err.message);
                    process.exit(1);
                }
            },
        }),
        JwtModule.register({ global: true }),
        TelegrafModule.forRoot({
            token: appConfig.TELEGRAM_BOT_TOKEN,
            launchOptions: {},
            middlewares: [session()]
        }),
        ScheduleTeacherModule,
        LessonTemplateModule,
        AuthModule,
        AdminModule,
        StudentModule,
        TeacherModule,
        PaymentModule,
        CertificateModule,
        NotificationModule,
        BotModule,
        CourseModule,
        StatisticaModule,
        ScheduleModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

