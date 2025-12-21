import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonEntity } from './entities/lesson.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LessonService extends BaseService<CreateLessonDto, UpdateLessonDto, LessonEntity> {
  constructor(@InjectRepository(LessonEntity) private readonly lessonRepository: Repository<LessonEntity>) { super(lessonRepository) }
  createLesson(dto: CreateLessonDto) {
    return 'This action adds a new lesson';
  }

  findAllLesson() {
    return `This action returns all lesson`;
  }

  findOneLesson(id: number) {
    return `This action returns a #${id} lesson`;
  }

  updateLesson(id: number, dto: UpdateLessonDto) {
    return `This action updates a #${id} lesson`;
  }

  removeLesson(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
