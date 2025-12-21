import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
    @ApiPropertyOptional({
        example: '2025-12-20',
        description: 'Bloklangan sana',
    })
    @IsOptional()
    @IsDateString()
    blockedAt?: Date

    @ApiPropertyOptional({
        example: 'Qoidabuzarlik',
        description: 'Blok sababi',
    })
    @IsOptional()
    @IsString()
    blockedReason?: string
    
}
