import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsInt()
    specificationId?: number

    @ApiPropertyOptional({ example: 123456789 })
    @IsOptional()
    @IsInt()
    googleId?: number

    @ApiPropertyOptional({ example: '8600123412341234' })
    @IsOptional()
    @IsString()
    cardNumber?: string

    @ApiPropertyOptional({ example: 'https://github.com/teacher' })
    @IsOptional()
    @IsString()
    portfolioLink?: string
}
