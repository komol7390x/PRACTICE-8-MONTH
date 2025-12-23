import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./strategy/google.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TeacherEntity } from "../teacher/entities/teacher.entity";
import { TokenService } from "src/infrastructure/token/Token";

@Module({
    imports: [
        JwtModule.register({ secret: process.env.JWT_SECRET }),
        TypeOrmModule.forFeature([TeacherEntity])
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy, TokenService],
})
export class AuthModule2 { }