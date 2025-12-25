import { Module } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { LessonTemplateController } from './lesson-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { TeacherModule } from 'src/api/user/teacher/teacher.module';

@Module({
  imports: [TypeOrmModule.forFeature([LessonTemplateEntity]), TeacherModule],
  controllers: [LessonTemplateController],
  providers: [LessonTemplateService],
  exports: [LessonTemplateService]
})
export class LessonTemplateModule { }
