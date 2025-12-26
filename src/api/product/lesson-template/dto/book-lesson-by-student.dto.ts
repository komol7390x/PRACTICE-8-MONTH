import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class BookLessonByStudentDto {
    
    @ApiProperty({ name: 'lessonId', type: 'number', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    lessonId: number

    @ApiProperty({ name: 'price', type: 'number', example: 50000 })
    @IsNumber()
    @IsNotEmpty()
    price: number

}
