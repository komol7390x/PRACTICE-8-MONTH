import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger'
import { Roles } from '../enum/roles.enum';
import { RequestMethod, Type } from 'src/api/product/logger/enum/type';

export function ApiFilterQueries() {
    return applyDecorators(
        ApiQuery({ name: 'role', required: false, enum: Roles, description: 'Foydalanuvchi roli' }),
        ApiQuery({ name: 'method', required: false, enum: RequestMethod, description: 'HTTP Metodi' }),
        ApiQuery({ name: 'type', required: false, enum: Type, description: 'Turini tanlang' }),
        ApiQuery({ name: 'search', required: false, type: String, description: 'Qidiruv so\'zi' }),
        ApiQuery({ name: 'page', required: false, type: Number, }),
        ApiQuery({ name: 'limit', required: false, type: Number, })
    );
}