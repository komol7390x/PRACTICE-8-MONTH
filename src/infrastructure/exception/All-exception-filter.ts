import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { QueryFailedError } from 'typeorm';
import * as geoip from 'geoip-lite';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (host.getType() !== 'http') {
      this.logger.error('Non-HTTP Error caught:', exception);
      return;
    }

    // 1. DEFAULT QIYMATLAR
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // 2. XATOLIK TURINI ANIQLASH (MAPPING)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = (res as any).message || res;
    }
    else if (exception instanceof QueryFailedError) {
      status = (exception as any).code === '23505' ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      message = (exception as any).code === '23505' ? 'Duplicate entry' : 'Database error';
    }
    // AGAR xatolik obyekt bo'lsa va ichida statusCode/status bo'lsa (Sizdagi holat)
    else if (exception?.statusCode || exception?.status) {
      status = exception.statusCode || exception.status;
      message = exception.message || 'Error occurred';
    }

    // 3. IP VA GEO-LOCATION
    const clientIp =
      (request?.headers?.['x-forwarded-for'] as string)?.split(',')[0] ||
      request?.ip ||
      request?.socket?.remoteAddress ||
      '127.0.0.1';

    const geo = geoip.lookup(clientIp);
    const country = geo ? geo.country : 'Local';

    // 4. STACK TRACE VA LOGGING
    const stack = exception instanceof Error
      ? exception.stack
      : `Non-standard error: ${JSON.stringify(exception)}`;

    const logSummary = `${request.method} ${request.url} | Status: ${status} | Country: ${country}`;

    if (status >= 500) {
      this.logger.error(`${logSummary} | Error: ${JSON.stringify(message)}`, stack);
    } else {
      this.logger.warn(`${logSummary} | Warning: ${JSON.stringify(message)}`);
    }

    // 5. CLIENTGA JAVOB QAYTARISH
    const responseBody = {
      success: false,
      statusCode: status,
      // Validation xatolari bo'lsa (Array), birinchisini yoki hammasini chiroyli chiqarish
      message: Array.isArray(message) ? message.join(', ') : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}