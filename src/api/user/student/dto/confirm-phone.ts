import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class ConfirmPhoneDto {
    @ApiProperty({ example: '+998935720473', type: 'string' })
    @IsPhoneNumber('UZ')
    @IsString()
    @IsNotEmpty()
    phoneNumber: string
}