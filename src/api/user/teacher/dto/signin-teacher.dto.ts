import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SigninTeacherDto {
    @ApiProperty({
        type: String,
        description: 'teacher email',
        example: 'www.komol8689@gmail.com',
    })
    @IsString({ message: 'is must string' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: String,
        description:
            'Mustahkam parol: kamida 8 ta belgi, 1 ta katta harf, 1 ta kichik harf, 1 ta raqam va 1 ta maxsus belgi bolishi kerak',
        example: '@Komol12345',
    })
    @IsString({ message: 'password satr (string) bolishi kerak' })
    @IsNotEmpty({ message: "password bo'sh bo'lmasligi kerak" })
    password: string;
}