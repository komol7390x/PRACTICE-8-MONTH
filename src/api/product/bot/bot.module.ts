import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
// import { BotController } from './bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { BotUpdate } from './bot.update';
import { LessonTemplateModule } from '../lesson-template/lesson-template.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity]), LessonTemplateModule],
  // controllers: [BotController],
  providers: [BotService, BotUpdate],
  exports: [BotService]
})
export class BotModule { }
