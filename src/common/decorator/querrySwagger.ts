import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
    return applyDecorators(
        ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    );
}