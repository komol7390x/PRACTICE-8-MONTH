import { Module } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { LessonTemplateController } from './lesson-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonTemplateEntity } from './entities/lesson-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonTemplateEntity])],
  controllers: [LessonTemplateController],
  providers: [LessonTemplateService],
  exports:[LessonTemplateService]
})
export class LessonTemplateModule { }
