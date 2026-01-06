import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { LanguageLevel } from 'src/api/product/certificate/enum/lang-level';

export function ApiCertificateFilters() {
    return applyDecorators(
        ApiQuery({ name: 'active', type: Boolean, required: false, description: 'Aktivlik holati' }),
        ApiQuery({ name: 'level', enum: LanguageLevel, required: false, description: 'Til bilish darajasi' }),
        ApiQuery({ name: 'search', type: String, required: false, description: 'Qidiruv matni' }),
        ApiQuery({ name: 'page', type: Number, required: false, example: 1, description: 'Sahifa raqami' }),
        ApiQuery({ name: 'limit', type: Number, required: false, example: 10, description: 'Elementlar soni' }),
    );
}