import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class RegisterStep2Dto {
    @ApiProperty({ example: '+998935720473', type: 'string' })
    @IsPhoneNumber('UZ')
    @IsString()
    @IsNotEmpty()
    phoneNumber: string

    @ApiProperty({ example: '@Komol12345', type: 'string' })
    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password: string
}