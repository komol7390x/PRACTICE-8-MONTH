import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class ConfirmmTelEmailDto {
    @ApiProperty({ example: '+998935720473', type: 'string' })
    @IsPhoneNumber('UZ')
    @IsString()
    @IsOptional()
    phoneNumber?: string

    @ApiProperty({ example: 'teacher@mail.com' })
    @IsEmail()
    @IsOptional()
    email?: string
}