import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from 'src/config';
import { AdminModule } from './user/admin/admin.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
