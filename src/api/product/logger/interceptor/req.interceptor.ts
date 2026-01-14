import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerEntity } from '../entities/logger.entity';
import { RequestMethod, Type } from '../enum/type';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(LoggerEntity)
        private readonly loggerRepo: Repository<LoggerEntity>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query, params, user } = request;

        // String metodni RequestMethod enumiga o'tkazamiz
        const currentMethod = method.toUpperCase() as RequestMethod;

        // Faqat biz xohlagan metodlar bo'lsa log qilamiz
        const isLoggable = Object.values(RequestMethod).includes(currentMethod);

        if (!isLoggable) {
            return next.handle();
        }

        // 1. Requestni saqlash
        this.saveLog(user, currentMethod, url, Type.REQUEST, { body, query, params });

        return next.handle().pipe(
            tap((responseData) => {
                // 2. Response saqlash
                this.saveLog(user, currentMethod, url, Type.RESPONSE, responseData);
            }),
        );
    }

    private async saveLog(user: any, method: RequestMethod, path: string, type: Type, data: any) {
        try {
            // Create va Save metodlarini alohida chaqirish tiplar bilan bog'liq xatoni oldini oladi
            const log = new LoggerEntity();
            log.userId = user?.id;
            log.role = user?.role;
            log.method = method; // Endi RequestMethod tipi bilan mos keladi
            log.path = path;
            log.type = type;
            log.data = data;

            await this.loggerRepo.save(log);
        } catch (error) {
            console.error('Logger xatosi:', error.message);
        }
    }
}