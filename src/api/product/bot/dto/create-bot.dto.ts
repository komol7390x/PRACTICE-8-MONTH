import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class CreateBotDto {

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber('UZ')
    phoneNumber: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    tgId: string

    @IsString()
    @IsNotEmpty()
    tgUsername: string

}
