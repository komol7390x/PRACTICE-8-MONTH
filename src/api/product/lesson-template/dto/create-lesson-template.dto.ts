import { ApiProperty } from "@nestjs/swagger";
import { WeekDays } from "../enum/week-day";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateLessonTemplateDto {
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
}
