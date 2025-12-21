import { ApiProperty } from '@nestjs/swagger'
import {
    IsString,

    IsPhoneNumber,
    IsNotEmpty,
} from 'class-validator'

export class CreateStudentDto {
    @ApiProperty({
        example: '+998901234567',
        description: 'Foydalanuvchi telefon raqami',
    })
    @IsString()
    @IsPhoneNumber('UZ')
    @IsNotEmpty()
    phoneNumber: string

    @ApiProperty({
        example: '123456789',
        description: 'Telegram ID',
    })
    @IsString()
    @IsNotEmpty()
    tgId: string

    @ApiProperty({
        example: 'Aliyev',
        description: 'Familiyasi',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty({
        example: 'Ali',
        description: 'Ismi',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty({
        example: 'ali_dev',
        description: 'Telegram username',
    })
    @IsString()
    @IsNotEmpty()
    tgUsername: string
}
