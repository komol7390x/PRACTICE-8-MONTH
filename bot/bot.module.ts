import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
// import { BotController } from './bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { BotUpdate } from './bot.update';
import { TokenService } from 'src/infrastructure/token/Token';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
  // controllers: [BotController],
  providers: [BotService, BotUpdate, TokenService],
  exports: [BotService]
})
export class BotModule { }
