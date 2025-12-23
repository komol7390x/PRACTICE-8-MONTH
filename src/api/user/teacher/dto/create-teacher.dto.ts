import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
    IsEmail,
    IsString,
    IsOptional,
    IsInt,
    Min,
} from 'class-validator'

export class CreateTeacherDto {
    @ApiProperty({ example: 'teacher@mail.com' })
    @IsEmail()
    email: string

    @ApiProperty({ example: '+998901234567' })
    @IsString()
    phoneNumber: string

    @ApiPropertyOptional({ example: 'Ali Valiyev' })
    @IsOptional()
    @IsString()
    fullname?: string

    @ApiProperty({ example: 'StrongPassword123' })
    @IsString()
    password: string

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsInt()
    @Min(0)
    expirence?: number
}
