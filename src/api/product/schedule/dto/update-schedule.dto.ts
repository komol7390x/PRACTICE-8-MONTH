import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsOptional } from 'class-validator';


export class UpdateScheduleDto {
    @ApiProperty({ type: 'number', example: 1768478441000 })
    @ApiPropertyOptional()
    @IsOptional()
    startTime?: string;

    @ApiProperty({ type: 'number', example: 1768500041000 })
    @ApiPropertyOptional()
    @IsOptional()
    finishTime?: string;
}