import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerEntity } from '../entities/logger.entity';
import { RequestMethod, Type } from '../enum/type';
import { Roles } from 'src/common/enum/roles.enum';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(LoggerEntity)
        private readonly loggerRepo: Repository<LoggerEntity>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const type = context.getType();

        // --- HTTP LOGGING ---
        if (type === 'http') {
            const request = context.switchToHttp().getRequest();
            const { method, url, body, query, params, user } = request;
            const currentMethod = method?.toUpperCase() as RequestMethod;

            if (Object.values(RequestMethod).includes(currentMethod)) {
                this.saveLog(user, currentMethod, url, Type.REQUEST, { body, query, params });
                return next.handle().pipe(
                    tap(res => this.saveLog(user, currentMethod, url, Type.RESPONSE, res))
                );
            }
        }

        // --- TELEGRAM (TELEGRAF) LOGGING ---
        // Telegraf odatda 'rpc' yoki maxsus kontekst turini ishlatadi
        if (type as string === 'telegraf' || type === 'rpc') {
            const tgContext = context.getArgByIndex(0); // Telegram context (ctx)

            // Telegramdan kelgan ma'lumotlar
            const user = tgContext.from; // User ma'lumotlari (id, username)
            const updateType = tgContext.updateType; // message, callback_query va h.k.
            const message = tgContext.message?.text || tgContext.callbackQuery?.data;

            // Telegram loglarini saqlash
            this.saveLog(
                { id: user?.id, role: Roles.STUDENT },
                updateType.toUpperCase(), 
                'TELEGRAM_BOT',
                Type.REQUEST,
                { message, raw: tgContext.update }
            );
        }

        return next.handle();
    }

    private async saveLog(user: any, method: any, path: string, type: Type, data: any) {
        try {
            const log = new LoggerEntity();
            log.userId = user?.id?.toString();
            log.role = user?.role || 'USER';
            log.method = method;
            log.path = path;
            log.type = type;
            log.data = data;

            await this.loggerRepo.save(log);
        } catch (error) {
            console.error('Logger xatosi:', error.message);
        }
    }
}