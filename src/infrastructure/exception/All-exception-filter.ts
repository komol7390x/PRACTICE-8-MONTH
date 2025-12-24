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
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    if (host.getType() !== 'http') {
      this.logger.error('Bot Error:', exception);
      return;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // ----------------------------------------------------
    // XATOLIK TURINI ANIQLASH
    // ----------------------------------------------------
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const responseBody = exception.getResponse();
      message = (responseBody as any).message || responseBody;
    } else if (exception instanceof QueryFailedError) {
      httpStatus = (exception as any).code === '23505' ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      message = (exception as any).code === '23505' ? 'Duplicate entry' : 'Database error';
    }

    // ----------------------------------------------------
    // IP VA GEO-LOCATION (XAVFSIZ USUL)
    // ----------------------------------------------------
    // Siz so'ragan xavfsiz IP olish usuli:
    const clientIp =
      (request?.headers?.['x-forwarded-for'] as string)?.split(',')[0] ||
      request?.ip ||
      request?.socket?.remoteAddress ||
      'Unknown IP';

    const geo = geoip.lookup(clientIp);
    const country = geo ? geo.country : 'Local';
    const userAgent = request?.headers?.['user-agent'] || 'Unknown Device';

    // ----------------------------------------------------
    // LOGGING
    // ----------------------------------------------------
    const logData = {
      statusCode: httpStatus,
      path: request?.url,
      method: request?.method,
      ip: clientIp,
      country,
    };

    if (httpStatus >= 500) {
      this.logger.error(`SERVER_ERROR | ${JSON.stringify(logData)}`, (exception as Error).stack);
    } else {
      this.logger.warn(`CLIENT_ERROR | ${JSON.stringify(logData)}`);
    }

    // ----------------------------------------------------
    // CLIENT'GA JAVOB QAYTARISH
    // ----------------------------------------------------
    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}