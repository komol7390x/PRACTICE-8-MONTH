import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsInt,
    Min,
    IsNumber
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageLevel } from '../enum/lang-level';

export class CreateCertificateDto {
    @ApiProperty({ example: 'IELTS Preparation' })
    @IsString()
    @IsNotEmpty()
    specificationName: string;

    @ApiProperty({ enum: LanguageLevel, example: LanguageLevel.B2 })
    @IsEnum(LanguageLevel)
    @IsNotEmpty()
    level: LanguageLevel;

    @ApiPropertyOptional({ example: 'Advanced level language course description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 50000 })
    @IsInt()
    @Min(0)
    hourPrice: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    teacherId: number;
}
