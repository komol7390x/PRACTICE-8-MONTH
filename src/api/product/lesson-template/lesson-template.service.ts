import { Injectable } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto, UpdateLessonTemplateDto, LessonTemplateEntity> {
  constructor(@InjectRepository(LessonTemplateEntity) private readonly lessonTemplateRepository: Repository<LessonTemplateEntity>) { super(lessonTemplateRepository) }
  createLessonTemplate(dto: CreateLessonTemplateDto) {
    return 'This action adds a new lessonTemplate';
  }

  findAllLessonTemplate() {
    return `This action returns all lessonTemplate`;
  }

  findOneLessonTemplate(id: number) {
    return `This action returns a #${id} lessonTemplate`;
  }

  updateLessonTemplate(id: number, dto: UpdateLessonTemplateDto) {
    return `This action updates a #${id} lessonTemplate`;
  }

  removeLessonTemplate(id: number) {
    return `This action removes a #${id} lessonTemplate`;
  }
}
