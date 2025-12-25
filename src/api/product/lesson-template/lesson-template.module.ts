import { Module } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { LessonTemplateController } from './lesson-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonTemplateEntity, TeacherEntity, StudentEntity])],
  controllers: [LessonTemplateController],
  providers: [LessonTemplateService],
  exports: [LessonTemplateService]
})
export class LessonTemplateModule { }
