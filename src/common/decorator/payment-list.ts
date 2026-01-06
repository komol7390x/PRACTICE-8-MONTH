import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { PaymentStatus } from 'src/api/product/payment/enum/payment-status';
import { Roles } from '../enum/roles.enum';


export function ApiFilterQueries() {
    return applyDecorators(
        ApiQuery({ name: 'active', type: Boolean, required: false, description: 'Aktivlik holati' }),
        ApiQuery({ name: 'status', enum: PaymentStatus, required: false, description: 'To\'lov holati' }),
        ApiQuery({ name: 'role', enum: Roles, required: false, description: 'Foydalanuvchi roli' }),
        ApiQuery({ name: 'search', type: String, required: false, description: 'Qidiruv matni' }),
        ApiQuery({ name: 'page', type: String, required: false, example: '1', description: 'Sahifa raqami' }),
        ApiQuery({ name: 'limit', type: String, required: false, example: '10', description: 'Sahifadagi elementlar soni' }),
    );
}