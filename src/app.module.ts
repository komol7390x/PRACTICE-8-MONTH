import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from 'src/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './api/user/admin/admin.module';
import { LessonModule } from './api/product/lesson/lesson.module';
import { TeacherModule } from './api/user/teacher/teacher.module';
import { StudentModule } from './api/user/student/student.module';
import { PaymentModule } from './api/product/payment/payment.module';
import { ScheduleModule } from './api/product/schedule/schedule.module';
import { EarningsModule } from './api/product/earnings/earnings.module';
import { StatisticaModule } from './api/product/statistica/statistica.module';
import { CertificateModule } from './api/product/certificate/certificate.module';
import { AuthModule } from './api/user/auth/auth.module';
import { EducationModule } from './api/post/education/education.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        
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
        AdminModule,
        LessonModule,
        TeacherModule,
        StudentModule,
        PaymentModule,
        ScheduleModule,
        EarningsModule,
        StatisticaModule,
        CertificateModule,
        AuthModule,
        EducationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
