import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateScheduleDto {
    @ApiProperty({ type: 'number', example: 175554484 })
    @IsNumber()
    @IsNotEmpty()
    startTime: number

    @ApiProperty({ type: 'number', example: 175554484 })
    @IsNumber()
    @IsNotEmpty()
    finishTime: number

    @ApiProperty({ type: 'string', example: 'Fizika' })
    @IsString()
    @IsNotEmpty()
    lessonName: string

    @ApiProperty({ type: 'number', example: 50000 })
    @IsNumber()
    @IsNotEmpty()
    lessonPrice: number

    @ApiPropertyOptional({ type: 'number', example: 1 })
    @IsNumber()
    @IsOptional()
    teacherId?: number
}
