import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { WeekDays } from 'src/api/product/lesson-template/enum/week-day';

export function ApiScheduleQueries() {
    return applyDecorators(
        ApiQuery({ name: 'teacherId', required: false, type: Number }),
        ApiQuery({ name: 'active', required: false, type: Boolean }),
        ApiQuery({ name: 'search', required: false, type: String }),
        ApiQuery({ name: 'page', required: false, type: Number }),
        ApiQuery({ name: 'limit', required: false, type: Number }),
        ApiQuery({ name: 'day', required: false, enum: WeekDays }),
    );
}