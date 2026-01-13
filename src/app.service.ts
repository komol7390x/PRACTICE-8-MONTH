import {
    ClassSerializerInterceptor,
    HttpStatus,
    Injectable,
    ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { appConfig } from 'src/config';
import { AllExceptionsFilter } from 'src/infrastructure/exception/All-exception-filter';
import { winstonConfig } from 'src/infrastructure/winston/winston.config';
import basicAuth from 'express-basic-auth';

@Injectable()
export class AppService {
    static async main() {
        // ---------------- APPMODULE ----------------
        const app = await NestFactory.create<NestExpressApplication>(AppModule, {
            logger: winstonConfig,
        });
        app.use(
            [`${appConfig.APP_VERSION}/swagger`,],
            basicAuth({
                challenge: true,
                users: {
                    admin: appConfig.SWAGGER.PASSWORD,
                },
            }),
        );

        app.use((_, res: express.Response, next) => {
            res.setHeader('ngrok-skip-browser-warning', 'true');
            next();
        });

        // ---------------- CORS ----------------
        app.enableCors({
            origin: true,
            methods: 'GET,PATCH,POST,DELETE',
            credentials: true,
        });

        // global interceptor
        app.useGlobalInterceptors(
            new ClassSerializerInterceptor(app.get(Reflector)),
        );

        const globalPrefix = appConfig.APP_VERSION;
        app.setGlobalPrefix(globalPrefix);

        // cookies
        app.use(cookieParser());

        const httpAdapter = app.get(HttpAdapterHost);

        // error handle
        app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

        app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

        const staticFile = join(__dirname, `../${appConfig.UPLOAD_FOLDER}`);
        app.use(`/${globalPrefix}/${appConfig.UPLOAD_FOLDER}`, express.static(staticFile));

        // validation pipe
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: false,
                transform: true,
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                transformOptions: { enableImplicitConversion: true },
                validationError: { target: false },
                stopAtFirstError: true,
                disableErrorMessages: appConfig.NODE_ENV === 'production',
                exceptionFactory: (errors) => {
                    const messages = errors
                        .map((err) => Object.values(err.constraints || {}))
                        .flat();
                    return {
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: messages,
                        error: 'Unprocessable Entity',
                    };
                },
            }),
        );

        // swagger
        const config = new DocumentBuilder()
            .setTitle('ONLINE SCHOOL API')
            .setVersion('1.0')
            .addBearerAuth({
                type: 'http',
                scheme: 'Bearer',
                in: 'Header',
            })
            .build();
        const swagger = 'swagger'
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup(`${appConfig.APP_VERSION}/${swagger}`, app, documentFactory());

        await app.listen(appConfig.PORT, () => {
            console.log(`Server started on port ${appConfig.PORT} \n`);
            console.log(`http://${appConfig.DOMAIN}:${appConfig.PORT}/${appConfig.APP_VERSION}`)
            console.log(`Swagger http://${appConfig.DOMAIN}:${appConfig.PORT}/${appConfig.APP_VERSION}/${swagger}`)
        });
    }
}

