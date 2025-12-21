import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
    @ApiPropertyOptional({
        example: 'Qoidabuzarlik',
        description: 'Blok sababi',
    })
    @IsOptional()
    @IsString()
    blockedReason?: string

}
