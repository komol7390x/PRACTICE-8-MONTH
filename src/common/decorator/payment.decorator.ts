import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Roles } from '../enum/roles.enum';
import { PaymentStatus } from 'src/api/product/payment/enum/payment-status';

export const ApiPaymentFilters = () => {
    return applyDecorators(
        ApiQuery({ name: 'status', enum: PaymentStatus, required: false }),
        ApiQuery({ name: 'role', enum: Roles, required: false }),
        ApiQuery({ name: 'active', type: Boolean, required: false }),
        ApiQuery({ name: 'deleted', type: Boolean, required: false }),
        ApiQuery({ name: 'search', type: String, required: false, description: 'Qidiruv: lessonId, studentId, teacherId, reason' }),
        ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
        ApiQuery({ name: 'limit', type: Number, required: false, example: 10 }),
    );
};