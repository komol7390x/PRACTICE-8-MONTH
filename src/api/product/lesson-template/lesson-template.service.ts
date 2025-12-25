import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherService } from 'src/api/user/teacher/teacher.service';
import { successRes } from 'src/infrastructure/response/success.response';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto,
  UpdateLessonTemplateDto, LessonTemplateEntity> {
  constructor(@InjectRepository(LessonTemplateEntity)
  private readonly lessonTempRepo: Repository<LessonTemplateEntity>,
    private readonly teacherService: TeacherService
  ) { super(lessonTempRepo) }
  async createLessonTemplate(teacherId: number, dto: CreateLessonTemplateDto) {
    const { finishTime, name, startTime, weekDay } = dto
    if (finishTime < startTime) {
      throw new BadRequestException(`${startTime} is not must bigger ${finishTime}`)
    }
    await this.teacherService.findOneTeacher(teacherId)
    const existWeekDay = await this.lessonTempRepo.findOne({ where: { weekDay } })
    if (existWeekDay) {

    }
    const data = await this.lessonTempRepo.save(
      this.lessonTempRepo.create({
        finishTime, name, startTime, teacherId, weekDay
      })
    )
    return successRes(data, 201)
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
