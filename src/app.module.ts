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
import { StatisticaModule } from './api/product/statistica/statistica.module';
import { CertificateModule } from './api/product/certificate/certificate.module';
// import { AuthModule } from './api/user/auth/auth.module';
import { GoogleModule } from './api/product/google/google.module';
import { LessonTemplateModule } from './api/product/lesson-template/lesson-template.module';
import { DeleteUserModule } from './api/product/delete-user/delete-user.module';
import { TeacherPaymentModule } from './api/product/teacher-payment/teacher-payment.module';
import { TransactionModule } from './api/product/transaction/transaction.module';
import { LessonHistoryModule } from './api/product/lesson-history/lesson-history.module';
import { NotificationModule } from './api/product/notification/notification.module';

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
        StudentModule,
        TeacherModule,
        LessonModule,
        PaymentModule,
        ScheduleModule,
        StatisticaModule,
        CertificateModule,
        // AuthModule,
        GoogleModule,
        LessonTemplateModule,
        DeleteUserModule,
        TeacherPaymentModule,
        TransactionModule,
        LessonHistoryModule,
        NotificationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
