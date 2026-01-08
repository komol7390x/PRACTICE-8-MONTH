import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLessonTemplateDto {
    @ApiProperty({ type: 'number', example: 175554484 })
    @IsNumber()
    @IsNotEmpty()
    startTime: number

    @ApiProperty({ type: 'number', example: 175554484 })
    @IsNumber()
    @IsNotEmpty()
    finishTime: number
}
