import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Roles } from "src/common/enum/roles.enum";

export class CreatePaymentDto {
    @ApiProperty({ type: 'string', description: 'User role', example: Roles.STUDENT, name: 'role' })
    @IsEnum(Roles)
    @IsNotEmpty()
    role: Roles

    @ApiPropertyOptional({ type: 'number', description: 'student id', example: 1 })
    @IsNumber()
    @IsOptional()
    studentId: number

    @ApiPropertyOptional({ type: 'number', description: 'lesson id', example: 1 })
    @IsNumber()
    @IsOptional()
    lessonId: number

    @ApiPropertyOptional({ type: 'number', description: 'teacher id', example: 1 })
    @IsNumber()
    @IsOptional()
    teacherId: number

    @ApiPropertyOptional({ type: 'number', description: 'payment amount price', example: 100000 })
    @IsDecimal()
    @IsNotEmpty()
    price: number
}
